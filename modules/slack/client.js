const { WebClient } = require('@slack/web-api');
const { SLACK_TOKEN } = require('../../config');

exports.client = new WebClient(SLACK_TOKEN);
