const { body } = require('express-validator');

const signupValidator = [
  body('fullName').trim().isLength({ min: 2, max: 80 }).escape(),
  body('email').trim().isEmail().normalizeEmail(),
  body('password')
    .isStrongPassword({
      minLength: 10,
      minLowercase: 1,
      minUppercase: 1,
      minNumbers: 1,
      minSymbols: 1
    })
    .withMessage('Password must contain uppercase, lowercase, number, symbol and length >= 10')
];

const loginValidator = [
  body('email').trim().isEmail().normalizeEmail(),
  body('password').isLength({ min: 1, max: 128 })
];

const profileValidator = [
  body('fullName').optional().trim().isLength({ min: 2, max: 80 }).escape()
];

module.exports = { signupValidator, loginValidator, profileValidator };