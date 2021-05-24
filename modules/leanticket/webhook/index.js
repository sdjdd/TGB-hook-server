const events = require('../events');

function handleIncomingInvocation(data) {
  console.log('[LeanTicket:webhook]: incoming data:', data);
  switch (data.action) {
    case 'ticket.create':
      events.emit('ticket:create', data.payload.ticket);
      break;
    case 'ticket.update':
      events.emit('ticket:update', data.payload.ticket, data.payload.updatedKeys);
      break;
  }
}

module.exports = { handleIncomingInvocation };
