module.exports = {
  LEANTICKET_WEBHOOK_SECRET: process.env.LEANTICKET_WEBHOOK_SECRET,
  LEANTICKET_HOST: process.env.LEANTICKET_HOST,
  LEANTICKET_APP_ID: process.env.LEANTICKET_APP_ID,
  LEANTICKET_APP_KEY: process.env.LEANTICKET_APP_KEY,
  LEANTICKET_MASTER_KEY: process.env.LEANTICKET_MASTER_KEY,
  LEANTICKET_SERVER_URL: process.env.LEANTICKET_SERVER_URL,

  SLACK_TOKEN: process.env.SLACK_TOKEN,
  SLACK_CHANNEL: process.env.SLACK_CHANNEL,

  jira: {
    host: process.env.JIRA_HOST,
    projectId: process.env.JIRA_PROJECT_ID,
    issueTypeId: process.env.JIRA_ISSUE_TYPE_ID,
    componentIds: process.env.JIRA_COMPONENT_IDS?.split(','),
    customFields: JSON.parse(process.env.JIRA_CUSTOM_FIELDS || '{}'),
  },
};
