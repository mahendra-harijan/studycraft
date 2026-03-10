const { body, param } = require('express-validator');

const taskCreateValidator = [
  body('title').trim().isLength({ min: 2, max: 120 }).escape(),
  body('description').optional().trim().isLength({ max: 500 }).escape(),
  body('deadline').isISO8601(),
  body('reminderAt').isISO8601(),
  body('priority').optional().isIn(['low', 'medium', 'high'])
];

const taskUpdateValidator = [
  param('id').isMongoId(),
  body('title').optional().trim().isLength({ min: 2, max: 120 }).escape(),
  body('description').optional().trim().isLength({ max: 500 }).escape(),
  body('deadline').optional().isISO8601(),
  body('reminderAt').optional().isISO8601(),
  body('priority').optional().isIn(['low', 'medium', 'high']),
  body('completed').optional().isBoolean()
];

const taskIdValidator = [param('id').isMongoId()];

module.exports = { taskCreateValidator, taskUpdateValidator, taskIdValidator };