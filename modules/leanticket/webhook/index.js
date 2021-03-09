const { notifyNewTicket, notifyUpdateTicket } = require('../../slack/notification');

function handleIncomingInvocation(data) {
  console.log('[LeanTicket:webhook]: incoming data:', data);
  switch (data.action) {
    case 'ticket.create':
      notifyNewTicket(data.payload.ticket);
      break;
    case 'ticket.update':
      notifyUpdateTicket(data.payload.ticket, data.payload.updatedKeys);
      break;
  }
}

module.exports = { handleIncomingInvocation };
