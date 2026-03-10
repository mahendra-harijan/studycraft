const { body } = require('express-validator');

const subscribeValidator = [
  body('subscription.endpoint').isURL({ require_tld: false }).isLength({ min: 20, max: 2000 }),
  body('subscription.keys.p256dh').isString().isLength({ min: 20, max: 300 }),
  body('subscription.keys.auth').isString().isLength({ min: 10, max: 200 })
];

const unsubscribeValidator = [
  body('endpoint').isURL({ require_tld: false }).isLength({ min: 20, max: 2000 })
];

module.exports = { subscribeValidator, unsubscribeValidator };