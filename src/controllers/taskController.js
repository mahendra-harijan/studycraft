const asyncHandler = require('../middlewares/asyncHandler');
const Task = require('../models/Task');
const ApiError = require('../utils/ApiError');

const mapTask = (task) => ({
  id: task._id,
  title: task.title,
  description: task.description,
  priority: task.priority,
  deadline: task.deadline,
  reminderAt: task.reminderAt,
  completed: task.completed
});

const validateTaskDates = (deadlineInput, reminderInput, checkFutureDeadline = true) => {
  const deadline = new Date(deadlineInput);
  const reminderAt = new Date(reminderInput);
  const now = new Date();

  if (Number.isNaN(deadline.getTime()) || Number.isNaN(reminderAt.getTime())) {
    throw new ApiError(422, 'Invalid date values');
  }
  if (checkFutureDeadline && deadline <= now) {
    throw new ApiError(422, 'Deadline must be in the future');
  }
  if (reminderAt > deadline) {
    throw new ApiError(422, 'Reminder must be before deadline');
  }
  return { deadline, reminderAt };
};

const getAll = asyncHandler(async (req, res) => {
  const tasks = await Task.find({ userId: req.user._id }).sort({ deadline: 1 });
  res.status(200).json({ success: true, data: tasks.map(mapTask) });
});

const create = asyncHandler(async (req, res) => {
  const { deadline, reminderAt } = validateTaskDates(req.body.deadline, req.body.reminderAt);

  const task = await Task.create({
    userId: req.user._id,
    title: req.body.title,
    description: req.body.description || '',
    priority: req.body.priority || 'medium',
    deadline,
    reminderAt,
    completed: false
  });

  res.status(201).json({ success: true, message: 'Task created', data: mapTask(task) });
});

const update = asyncHandler(async (req, res) => {
  const task = await Task.findOne({ _id: req.params.id, userId: req.user._id });
  if (!task) {
    throw new ApiError(404, 'Task not found');
  }

  const deadlineRaw = req.body.deadline ? req.body.deadline : task.deadline;
  const reminderRaw = req.body.reminderAt ? req.body.reminderAt : task.reminderAt;
  const checkFutureDeadline = req.body.deadline !== undefined || req.body.reminderAt !== undefined;
  const { deadline, reminderAt } = validateTaskDates(deadlineRaw, reminderRaw, checkFutureDeadline);

  if (req.body.title !== undefined) task.title = req.body.title;
  if (req.body.description !== undefined) task.description = req.body.description;
  if (req.body.priority !== undefined) task.priority = req.body.priority;
  if (req.body.completed !== undefined) task.completed = req.body.completed;
  task.deadline = deadline;
  task.reminderAt = reminderAt;

  await task.save();

  res.status(200).json({ success: true, message: 'Task updated', data: mapTask(task) });
});

const remove = asyncHandler(async (req, res) => {
  const task = await Task.findOneAndDelete({ _id: req.params.id, userId: req.user._id });
  if (!task) {
    throw new ApiError(404, 'Task not found');
  }
  res.status(200).json({ success: true, message: 'Task deleted' });
});

module.exports = { getAll, create, update, remove };