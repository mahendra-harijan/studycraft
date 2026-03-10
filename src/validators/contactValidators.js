const { body } = require('express-validator');

const sendContactValidator = [
  body('name').trim().isLength({ min: 2, max: 100 }),
  body('email').trim().isEmail().normalizeEmail().isLength({ max: 150 }),
  body('subject').trim().isLength({ min: 3, max: 150 }),
  body('message').trim().isLength({ min: 10, max: 1000 })
];

module.exports = { sendContactValidator };
