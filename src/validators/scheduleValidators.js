const { body, param } = require('express-validator');

const dayList = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

const scheduleCreateValidator = [
  body('subject').trim().isLength({ min: 2, max: 80 }).escape(),
  body('day').isIn(dayList),
  body('startTime').matches(/^([01]\d|2[0-3]):([0-5]\d)$/),
  body('endTime').matches(/^([01]\d|2[0-3]):([0-5]\d)$/),
  body('venue').trim().isLength({ min: 2, max: 120 }).escape(),
  body('weeklyRepeat').optional().isBoolean()
];

const scheduleUpdateValidator = [
  param('id').isMongoId(),
  body('subject').optional().trim().isLength({ min: 2, max: 80 }).escape(),
  body('day').optional().isIn(dayList),
  body('startTime').optional().matches(/^([01]\d|2[0-3]):([0-5]\d)$/),
  body('endTime').optional().matches(/^([01]\d|2[0-3]):([0-5]\d)$/),
  body('venue').optional().trim().isLength({ min: 2, max: 120 }).escape(),
  body('weeklyRepeat').optional().isBoolean()
];

const scheduleIdValidator = [param('id').isMongoId()];

module.exports = { scheduleCreateValidator, scheduleUpdateValidator, scheduleIdValidator };