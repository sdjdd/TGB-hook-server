module.exports = {
  leanTicket: {
    webhookSecret: process.env.LEANTICKET_WEBHOOK_SECRET,
    host: process.env.LEANTICKET_HOST,
  },
  slack: {
    token: process.env.SLACK_TOKEN,
    channel: process.env.SLACK_CHANNEL,
  },
};
