const JiraClient = require('jira-client');
const https = require('https');
const AV = require('leancloud-storage');

const { leanTicket } = require('../../../config');
const events = require('../events');

let config;
async function loadConfig() {
  const query = new AV.Query('HS_Config');
  query.equalTo('namespace', 'jira');
  query.select('key', 'value');
  const objects = await query.find({ useMasterKey: true });
  const newConfig = {};
  objects.forEach((obj) => {
    newConfig[obj.get('key')] = obj.get('value');
  });
  if (
    !newConfig.host ||
    !newConfig.access_token ||
    !newConfig.issue_type_id ||
    !newConfig.project_id
  ) {
    console.error('[Jira.loadConfig]: 缺少必要的配置');
  }
  return (config = newConfig);
}
loadConfig();

/**
 * @param {string} categoryId
 * @returns {Promise<string>}
 */
async function getCategoryName(categoryId) {
  const category = AV.Object.createWithoutData('Category', categoryId);
  await category.fetch({ include: ['parent'] }, { useMasterKey: true });
  if (category.has('parent')) {
    return (await getCategoryName(category.get('parent').id)) + '/' + category.get('name');
  }
  return category.get('name');
}

/**
 * @param {string} ticketId
 * @returns {object}
 */
async function getTicketData(ticketId) {
  const ticket = AV.Object.createWithoutData('Ticket', ticketId);
  await ticket.fetch({}, { useMasterKey: true });
  const categoryName = await getCategoryName(ticket.get('category').objectId);
  return { ...ticket.toJSON(), categoryName };
}

/**
 * @param {string} content
 * @param {object} [metaData]
 */
function makeIssueDescription(ticket) {
  let desc = `h3. *用户描述:*\n${ticket.content}`;
  if (ticket.metaData) {
    desc += '\n\nh3. *Metadata:*\n||key||value||';
    Object.entries(ticket.metaData).map(([key, value]) => (desc += `\n|${key}|${value}|`));
  }
  const ticketURL = `${leanTicket.host}/tickets/${ticket.nid}`;
  desc += `\n\nh3. *LeanTicket 链接:*\n${ticketURL}`;
  return desc;
}

/**
 * @param {Array<string>} fileIds
 * @returns {Array<string>}
 */
async function getFileURLs(fileIds) {
  const files = fileIds.map((id) => AV.Object.createWithoutData('_File', id));
  await AV.Object.fetchAll(files, { useMasterKey: true });
  return files.map((file) => file.get('url'));
}

async function createIssueFromTicket(ticketId, accessToken) {
  if (!config) {
    console.error('[Jira.createIssue]: config not initialized.', { ticketId, accessToken });
    return;
  }

  const jira = new JiraClient({
    protocol: 'https',
    host: config.host,
    bearer: accessToken || config.access_token,
    apiVersion: '2',
    strictSSL: true,
  });

  const ticket = await getTicketData(ticketId);
  const fields = {
    ...config.custom_fields,
    project: { id: config.project_id },
    summary: ticket.title,
    issuetype: { id: config.issue_type_id },
    components: config.component_ids?.map((id) => ({ id })),
    labels: [ticket.categoryName],
    description: makeIssueDescription(ticket),
  };

  const [result, fileURLs] = await Promise.all([
    jira.addNewIssue({ fields }),
    getFileURLs(ticket.files.map((f) => f.objectId)),
  ]);

  const issue = await addIssueObject(result.key, ticketId);
  ticket.jiraIssue = issue.toJSON();

  events.emit('issue:create', { ticket, key: result.key });

  fileURLs.forEach((url) => {
    https.get(url, (res) => {
      jira.addAttachmentOnIssue(result.id, res);
    });
  });

  return getIssueURL(result.key);
}

/**
 * @param {string} key
 * @returns {string}
 */
function getIssueURL(key) {
  return `https://${config.host}/browse/${key}`;
}

async function getIssueData(ticketId) {
  const query = new AV.Query('JiraIssue');
  query.equalTo('ticket.objectId', ticketId);
  const issue = await query.first({ useMasterKey: true });
  return issue?.toJSON();
}

function addIssueObject(key, ticketId) {
  const issue = new AV.Object('JiraIssue', {
    key,
    ACL: {},
    ticket: { objectId: ticketId },
  });
  return issue.save(null, { useMasterKey: true });
}

module.exports = { createIssueFromTicket, getIssueData, getIssueURL };
