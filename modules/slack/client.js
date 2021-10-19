const { WebClient, LogLevel } = require('@slack/web-api');
const { slack } = require('../../config');

if (slack.token) {
  exports.client = new WebClient(slack.token, {
    logLevel: LogLevel.DEBUG,
  });
}
