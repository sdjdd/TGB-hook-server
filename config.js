module.exports = {
  leanTicket: {
    webhookSecret: process.env.LEANTICKET_WEBHOOK_SECRET,
    host: process.env.LEANTICKET_HOST,
    appId: process.env.LEANTICKET_APP_ID,
    appKey: process.env.LEANTICKET_APP_KEY,
    masterKey: process.env.LEANTICKET_MASTER_KEY,
    serverURL: process.env.LEANTICKET_SERVER_URL,
  },
  slack: {
    token: process.env.SLACK_TOKEN,
    channel: process.env.SLACK_CHANNEL,
  },
  jira: {
    host: process.env.JIRA_HOST,
    projectId: process.env.JIRA_PROJECT_ID,
    issueTypeId: process.env.JIRA_ISSUE_TYPE_ID,
    componentIds: process.env.JIRA_COMPONENT_IDS?.split(','),
    customFields: JSON.parse(process.env.JIRA_CUSTOM_FIELDS || '{}'),
  },
};
