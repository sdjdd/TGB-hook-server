module.exports = {
  leanTicket: {
    webhookSecret: process.env.LEANTICKET_WEBHOOK_SECRET,
    host: process.env.LEANTICKET_HOST,
    appId: process.env.LEANCLOUD_APP_ID,
    appKey: process.env.LEANCLOUD_APP_KEY,
    masterKey: process.env.LEANCLOUD_APP_MASTER_KEY,
    serverURL: process.env.LEANTICKET_SERVER_URL,
  },
  slack: {
    token: process.env.SLACK_TOKEN,
    channel: process.env.SLACK_CHANNEL,
  },
};
