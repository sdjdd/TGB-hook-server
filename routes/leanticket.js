const crypto = require('crypto');
const router = require('express').Router();
const bodyParser = require('body-parser');
const { handleIncomingInvocation } = require('../modules/leanticket/webhook');
const { leanTicket } = require('../config');

router.use(bodyParser.text({ type: ['application/json'] }));

router.post('/webhook', (req, res) => {
  const sign = req.headers['x-leanticket-hmac-sha256'];
  if (!sign) {
    res.status(400).end();
    return;
  }
  res.status(200).end();

  const hash = crypto
    .createHmac('sha256', leanTicket.webhookSecret)
    .update(req.body)
    .digest('base64');
  if (hash === sign) {
    handleIncomingInvocation(JSON.parse(req.body));
  } else {
    console.error('[LeanTicket.webhook]: sign mismatch');
  }
});

module.exports = router;
