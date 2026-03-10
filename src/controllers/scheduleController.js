const asyncHandler = require('../middlewares/asyncHandler');
const Schedule = require('../models/Schedule');
const ApiError = require('../utils/ApiError');
const { parseTimeToMinutes, minutesToTime } = require('../utils/time');

const hasOverlap = (aStart, aEnd, bStart, bEnd) => aStart < bEnd && bStart < aEnd;

const mapSchedule = (item) => ({
  id: item._id,
  subject: item.subject,
  day: item.day,
  startTime: minutesToTime(item.startMinutes),
  endTime: minutesToTime(item.endMinutes),
  venue: item.venue,
  weeklyRepeat: item.weeklyRepeat
});

const getAll = asyncHandler(async (req, res) => {
  const data = await Schedule.find({ userId: req.user._id }).sort({ day: 1, startMinutes: 1 });
  res.status(200).json({ success: true, data: data.map(mapSchedule) });
});

const create = asyncHandler(async (req, res) => {
  const startMinutes = parseTimeToMinutes(req.body.startTime);
  const endMinutes = parseTimeToMinutes(req.body.endTime);

  if (startMinutes === null || endMinutes === null || startMinutes >= endMinutes) {
    throw new ApiError(422, 'Invalid time range');
  }

  const existing = await Schedule.find({ userId: req.user._id, day: req.body.day });
  const conflict = existing.find((row) => hasOverlap(startMinutes, endMinutes, row.startMinutes, row.endMinutes));
  if (conflict) {
    throw new ApiError(409, 'Class time clashes with an existing schedule');
  }

  const created = await Schedule.create({
    userId: req.user._id,
    subject: req.body.subject,
    day: req.body.day,
    startMinutes,
    endMinutes,
    venue: req.body.venue,
    weeklyRepeat: req.body.weeklyRepeat !== false
  });

  res.status(201).json({ success: true, message: 'Schedule created', data: mapSchedule(created) });
});

const update = asyncHandler(async (req, res) => {
  const existing = await Schedule.findOne({ _id: req.params.id, userId: req.user._id });
  if (!existing) {
    throw new ApiError(404, 'Schedule not found');
  }

  const nextData = {
    subject: req.body.subject ?? existing.subject,
    day: req.body.day ?? existing.day,
    startMinutes: req.body.startTime ? parseTimeToMinutes(req.body.startTime) : existing.startMinutes,
    endMinutes: req.body.endTime ? parseTimeToMinutes(req.body.endTime) : existing.endMinutes,
    venue: req.body.venue ?? existing.venue,
    weeklyRepeat: typeof req.body.weeklyRepeat === 'boolean' ? req.body.weeklyRepeat : existing.weeklyRepeat
  };

  if (nextData.startMinutes === null || nextData.endMinutes === null || nextData.startMinutes >= nextData.endMinutes) {
    throw new ApiError(422, 'Invalid time range');
  }

  const dayRows = await Schedule.find({
    userId: req.user._id,
    day: nextData.day,
    _id: { $ne: req.params.id }
  });

  const conflict = dayRows.find((row) => hasOverlap(nextData.startMinutes, nextData.endMinutes, row.startMinutes, row.endMinutes));
  if (conflict) {
    throw new ApiError(409, 'Class time clashes with an existing schedule');
  }

  Object.assign(existing, nextData);
  await existing.save();

  res.status(200).json({ success: true, message: 'Schedule updated', data: mapSchedule(existing) });
});

const remove = asyncHandler(async (req, res) => {
  const deleted = await Schedule.findOneAndDelete({ _id: req.params.id, userId: req.user._id });
  if (!deleted) {
    throw new ApiError(404, 'Schedule not found');
  }
  res.status(200).json({ success: true, message: 'Schedule deleted' });
});

module.exports = { getAll, create, update, remove };