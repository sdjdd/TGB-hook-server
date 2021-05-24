const AV = require('leancloud-storage');

const { client } = require('../client');
const { slack: config } = require('../../../config');
const { basicMessage } = require('./message');
const leanTicketEvents = require('../../leanticket/events');
const jiraEvents = require('../../jira/events');

/**
 * @param {object} assignee
 * @param {string} assignee.username
 * @param {string} [assignee.name]
 * @param {string} [assignee.email]
 */
async function getAssigneeDisplayName(assignee) {
  if (assignee.email) {
    try {
      const { user: slackUser } = await client.users.lookupByEmail({ email: assignee.email });
      if (slackUser) {
        return `<@${slackUser.id}>`;
      }
    } catch (error) {
      if (error.data?.error !== 'users_not_found') {
        throw error;
      }
    }
  }
  return assignee.name || assignee.username;
}

async function notifyNewTicket(ticket) {
  const assigneeName = await getAssigneeDisplayName(ticket.assignee);

  const { channel, ts } = await client.chat.postMessage({
    channel: config.channel,
    ...basicMessage(ticket, assigneeName),
  });

  await new AV.Object('SlackNotification', {
    ACL: {},
    channel,
    ts,
    ticket: {
      objectId: ticket.objectId,
    },
    assignee: {
      objectId: ticket.assignee.objectId,
      displayName: assigneeName,
    },
  }).save(null, { useMasterKey: true });
}

/**
 * @param {object} ticket
 * @param {array} updatedKeys
 */
async function notifyUpdateTicket(ticket, updatedKeys = []) {
  const notification = await new AV.Query('SlackNotification')
    .equalTo('ticket.objectId', ticket.objectId)
    .first();

  if (notification) {
    if (updatedKeys.includes('assignee')) {
      const assignee = AV.Object.createWithoutData('_User', ticket.assignee.objectId);
      await assignee.fetch({}, { useMasterKey: true });
      notification.set('assignee', {
        objectId: assignee.id,
        displayName: await getAssigneeDisplayName(assignee.toJSON()),
      });
      notification.save(null, { useMasterKey: true });
    }

    client.chat.update({
      channel: notification.get('channel'),
      ts: notification.get('ts'),
      ...basicMessage(ticket, notification.get('assignee').displayName),
    });
  }
}

leanTicketEvents.on('ticket:create', notifyNewTicket);
leanTicketEvents.on('ticket:update', notifyUpdateTicket);
jiraEvents.on('issue:create', ({ ticket }) => notifyUpdateTicket(ticket));
