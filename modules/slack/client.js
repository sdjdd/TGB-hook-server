const { WebClient, LogLevel } = require('@slack/web-api');
const { slack } = require('../../config');

exports.client = new WebClient(slack.token, {
  logLevel: LogLevel.DEBUG,
});
