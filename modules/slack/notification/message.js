const { leanTicket } = require('../../../config');

const MESSAGE_COLOR = {
  RED: '#DC3545',
  YELLOW: '#FFC107',
  ORANGE: '#FD7E14',
  GREEN: '#198754',
};

/**
 * @param {Date|string} date
 */
function formatDate(date) {
  if (typeof date === 'string') {
    date = new Date(date);
  }
  return `<!date^${parseInt(date.getTime() / 1000)}^{date_num} {time_secs}|${date.toISOString()}>`;
}

/**
 * @param {number} status
 */
function isOpenStatus(status) {
  return status === 50 || status === 120 || status === 160;
}

function basicMessage(ticket, assignedTo) {
  const isTicketOpen = isOpenStatus(ticket.status);

  let color;
  if (isTicketOpen) {
    if (ticket.jiraIssue) {
      color = MESSAGE_COLOR.ORANGE;
    } else {
      color = ticket.assignee ? MESSAGE_COLOR.YELLOW : MESSAGE_COLOR.RED;
    }
  } else {
    color = MESSAGE_COLOR.GREEN;
  }

  let url;
  if (leanTicket.host) {
    url = leanTicket.host + '/tickets/' + ticket.nid;
  }

  const action = {
    type: 'actions',
    elements: [
      {
        type: 'button',
        text: {
          type: 'plain_text',
          text: '查看工单',
        },
        url,
      },
    ],
  };
  if (isTicketOpen) {
    action.elements.push({
      type: 'button',
      text: {
        type: 'plain_text',
        text: '关闭工单',
      },
      style: 'danger',
      value: ticket.objectId,
      confirm: {
        style: 'danger',
        title: {
          type: 'plain_text',
          text: '要关闭工单吗？',
        },
        confirm: {
          type: 'plain_text',
          text: '确认关闭',
        },
        deny: {
          type: 'plain_text',
          text: '取消',
        },
      },
    });
  }

  const blocks = [
    {
      type: 'header',
      text: {
        type: 'plain_text',
        text: ticket.title,
      },
    },
    {
      type: 'section',
      fields: [
        {
          type: 'mrkdwn',
          text: `*创建时间:*\n${formatDate(ticket.createdAt)}`,
        },
        {
          type: 'mrkdwn',
          text: `*负责人:*\n${assignedTo}`,
        },
      ],
    },
    {
      type: 'section',
      text: {
        type: 'mrkdwn',
        text: `*内容*:\n${ticket.content}`,
      },
    },
  ];

  if (ticket.latestReply) {
    const { author } = ticket.latestReply;
    blocks.push({
      type: 'section',
      text: {
        type: 'mrkdwn',
        text: `*最新回复*:\n> _${author.name || author.username} 于 ${formatDate(
          ticket.latestReply.createdAt
        )}_\n${ticket.latestReply.content}`,
      },
    });
  }

  return {
    attachments: [
      {
        color,
        blocks: blocks.concat(action),
      },
    ],
  };
}

module.exports = { basicMessage };
