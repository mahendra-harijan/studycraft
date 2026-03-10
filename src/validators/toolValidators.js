const { body } = require('express-validator');

const matrixValidator = [
  body('operation').isIn(['add', 'subtract', 'multiply', 'divide', 'inverse', 'transpose', 'adjugate', 'determinant']),
  body('matrixA').isArray({ min: 1 }),
  body('matrixA.*').isArray({ min: 1 }),
  body('matrixB').optional().isArray({ min: 1 }),
  body('matrixB.*').optional().isArray({ min: 1 })
];

const cryptoValidator = [
  body('operation').isIn(['modExp', 'modInverse', 'gcd', 'primeCheck']),
  body('a').optional().isString(),
  body('b').optional().isString(),
  body('n').optional().isString()
];

module.exports = { matrixValidator, cryptoValidator };