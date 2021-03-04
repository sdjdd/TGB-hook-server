const { handleIncomingInvocation } = require('../modules/slack/webhook');

const router = require('express').Router();

router.post('/interactive-endpoint', (req, res) => {
  res.status(200).end();
  handleIncomingInvocation(JSON.parse(req.body.payload));
});

module.exports = router;
