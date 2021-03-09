const router = require('express').Router();
const { db } = require('../modules/leanticket/app');
const { createIssueFromTicket, getIssueURL, getIssueData } = require('../modules/jira/issue');

router.post('/issue', async (req, res) => {
  const { sessionToken, ticketId } = req.body;
  if (!sessionToken || !ticketId) {
    return res.status(400).send('The sessionToken and ticketId must be provided.');
  }

  const user = await db
    .class('_User')
    .where('sessionToken', '==', sessionToken)
    .first({ useMasterKey: true });
  if (!user) {
    return res.status(403).end();
  }

  const issue = await getIssueData(ticketId);
  if (issue) {
    return res.redirect(getIssueURL(issue.key));
  }

  const accessToken = user.data.authData?.jira?.access_token;
  if (!accessToken) {
    return res.status(400).send('未设置 Jira Access Token');
  }

  try {
    const url = await createIssueFromTicket(ticketId, accessToken);
    res.redirect(url);
  } catch (error) {
    console.error('[Jira:createIssue]:', error);
    res.status(400).send(error.message);
  }
});

module.exports = router;
