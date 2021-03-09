const JiraClient = require('jira-client');
const https = require('https');

const { db } = require('../../leanticket/app');
const { notifyUpdateTicket } = require('../../slack/notification');
const { jira: config } = require('../../../config');

if (!config.host || !config.issueTypeId || !config.projectId) {
  console.error('[Jira]: 缺少必要的配置');
  process.exit(1);
}

/**
 * @param {string} categoryId
 * @returns {Promise<string>}
 */
async function getCategoryName(categoryId) {
  const category = await db
    .class('Category')
    .object(categoryId)
    .get({ include: ['parent'], useMasterKey: true });
  if (category.data.parent) {
    return (await getCategoryName(category.data.parent.id)) + '/' + category.data.name;
  }
  return category.data.name;
}

/**
 * @param {string} ticketId
 * @returns {object}
 */
async function getTicketData(ticketId) {
  const ticket = await db.class('Ticket').object(ticketId).get({ useMasterKey: true });
  const categoryName = await getCategoryName(ticket.data.category.objectId);
  return { ...ticket.toJSON(), categoryName };
}

/**
 * @param {string} content
 * @param {object} [metaData]
 */
function makeIssueDescription(content, metaData) {
  let desc = 'h2. *用户描述:*\n' + content;
  if (metaData) {
    desc += '\n\nh2. *Metadata:*\n||key||value||\n';
    Object.entries(metaData).map(
      ([key, value]) => (desc += `|${key}|${value ?? '(undefined)'}|\n`)
    );
  }
  return desc;
}

/**
 * @param {Array<string>} fileIds
 * @returns {Array<string>}
 */
async function getFileURLs(fileIds) {
  const pipeline = db.pipeline();
  fileIds.map((id) => pipeline.get('_File', id));
  const { results } = await pipeline.commit({ useMasterKey: true });
  return results.map((file) => file.data.url);
}

async function createIssueFromTicket(ticketId, accessToken) {
  const jira = new JiraClient({
    protocol: 'https',
    host: config.host,
    bearer: accessToken,
    apiVersion: '2',
    strictSSL: true,
  });

  const [ticket, user] = await Promise.all([getTicketData(ticketId), jira.getCurrentUser()]);
  const fields = {
    ...config.customFields,
    project: { id: config.projectId },
    summary: ticket.title,
    assignee: { name: user.name },
    reporter: { name: user.name },
    issuetype: { id: config.issueTypeId },
    components: config.componentIds?.map((id) => ({ id })),
    labels: [ticket.categoryName],
    description: makeIssueDescription(ticket.content, ticket.metaData),
  };

  const [result, fileURLs] = await Promise.all([
    jira.addNewIssue({ fields }),
    getFileURLs(ticket.files.map((f) => f.objectId)),
  ]);

  const uploadTasks = fileURLs.map((url) => {
    return new Promise((resolve, reject) => {
      https
        .get(url, (res) => {
          jira.addAttachmentOnIssue(result.id, res).then(resolve).catch(reject);
        })
        .once('error', reject);
    });
  });
  await Promise.all(
    uploadTasks.concat(
      db
        .class('JiraIssue')
        .add({
          ACL: {},
          ticket: { objectId: ticketId },
          key: result.key,
        })
        .then((issue) => (ticket.jiraIssue = issue))
    )
  );

  notifyUpdateTicket(ticket);

  return getIssueURL(result.key);
}

function getIssueURL(key) {
  return `https://${config.host}/browse/${key}`;
}

async function getIssueData(ticketId) {
  const issue = await db
    .class('JiraIssue')
    .where('ticket.objectId', '==', ticketId)
    .first({ useMasterKey: true });
  return issue?.toJSON();
}

module.exports = { createIssueFromTicket, getIssueURL, getIssueData };
