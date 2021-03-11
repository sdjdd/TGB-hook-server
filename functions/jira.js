const AV = require('leanengine');

const { isCustomerService } = require('../modules/leanticket/common');
const { createIssueFromTicket, getIssueData, getIssueURL } = require('../modules/jira/issue');
const { jira } = require('../config');

/**
 * @param {AV.User} user
 */
async function assertUserIsCustomerService(user) {
  if (!user) {
    throw new AV.Cloud.Error('Unauthorized', { status: 401 });
  }
  if (!(await isCustomerService(user.id))) {
    throw new AV.Cloud.Error('Forbidden', { status: 403 });
  }
}

AV.Cloud.define('TGB_getJiraIssueURL', async (req) => {
  await assertUserIsCustomerService(req.currentUser);
  const { ticketId } = req.params;
  if (typeof ticketId !== 'string') {
    throw new AV.Cloud.Error('The ticketId must be a string', { status: 400 });
  }
  const issue = await getIssueData(ticketId);
  return issue ? getIssueURL(issue.key) : '';
});

AV.Cloud.define('TGB_createJiraIssue', async (req) => {
  await assertUserIsCustomerService(req.currentUser);
  const { ticketId } = req.params;
  if (typeof ticketId !== 'string') {
    throw new AV.Cloud.Error('The ticketId must be a string', { status: 400 });
  }
  const issue = await getIssueData(ticketId);
  if (issue) {
    return getIssueURL(issue.key);
  }
  return createIssueFromTicket(ticketId, jira.accessToken);
});
