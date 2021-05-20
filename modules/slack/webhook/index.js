const AV = require('leancloud-storage');
const { client } = require('../client');

function isCloseTicketAction(actions) {
  return actions && actions.length === 1 && actions[0].text.text === '关闭工单';
}

function handleIncomingInvocation(payload) {
  if (isCloseTicketAction(payload.actions)) {
    handleCloseTicket(payload.user.id, payload.actions[0].value);
  }
}

async function handleCloseTicket(slackUserId, ticketId) {
  const { profile } = await client.users.profile.get({ user: slackUserId });
  if (!profile || !profile.email) {
    return;
  }

  const user = await new AV.Query('_User')
    .equalTo('email', profile.email)
    .first({ useMasterKey: true });
  if (!user) {
    console.error(
      `[Slack.webhook]: slack user(${profile.email}) wants to close ticket(${ticketId}), but this email is not set in LeanTicket`
    );
    return;
  }

  await user.fetch({ keys: 'sessionToken' }, { useMasterKey: true });

  AV.Cloud.run('operateTicket', { ticketId, action: 'close' }, { user });
}

module.exports = { handleIncomingInvocation };
