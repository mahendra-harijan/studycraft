const cron = require('node-cron');
const Task = require('../models/Task');
const Schedule = require('../models/Schedule');
const Notification = require('../models/Notification');
const { sendPushToUser } = require('./webPushService');
const env = require('../config/env');

const createNotificationIfNotExists = async ({ userId, type, title, message, eventKey, details }) => {
  const exists = await Notification.findOne({ userId, eventKey });
  if (exists) return;
  await Notification.create({ userId, type, title, message, eventKey, details: details || {} });
  await sendPushToUser({ userId, title, message, type });
};

const createImmediateNotification = async ({ userId, type, title, message, details }) => {
  const eventKey = `${type}-${Date.now()}-${Math.random().toString(36).substring(7)}`;
  await Notification.create({ userId, type, title, message, eventKey, details: details || {} });
  await sendPushToUser({ userId, title, message, type });
};

const getDayName = () =>
  ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][new Date().getDay()];

const runClassStartTick = async () => {
  const now = new Date();
  const currentMinutes = now.getHours() * 60 + now.getMinutes();
  const today = getDayName();

  const classesStartingNow = await Schedule.find({
    day: today,
    startMinutes: currentMinutes
  }).select('userId subject day startMinutes endMinutes venue weeklyRepeat');

  const dateKey = now.toISOString().slice(0, 10);

  for (const item of classesStartingNow) {
    await createNotificationIfNotExists({
      userId: item.userId,
      type: 'class-start',
      title: 'Class starting now',
      message: `${item.subject} starts now at ${item.venue} (${String(Math.floor(item.startMinutes / 60)).padStart(2, '0')}:${String(item.startMinutes % 60).padStart(2, '0')} - ${String(Math.floor(item.endMinutes / 60)).padStart(2, '0')}:${String(item.endMinutes % 60).padStart(2, '0')})`,
      eventKey: `class-start-${item._id}-${dateKey}-${currentMinutes}`,
      details: {
        title: item.subject,
        description: `Class at ${item.venue}`,
        reminderTime: now,
        status: 'started'
      }
    });
  }
};

const runReminderTick = async () => {
  const now = new Date();
  const reminderWindowEnd = new Date(now.getTime() + 60 * 1000);
  const tasks = await Task.find({
    completed: false,
    reminderAt: { $gte: now, $lt: reminderWindowEnd }
  }).select('userId title deadline reminderAt completed');

  for (const task of tasks) {
    await createNotificationIfNotExists({
      userId: task.userId,
      type: 'task-reminder',
      title: 'Task reminder',
      message: `${task.title} due at ${new Date(task.deadline).toLocaleString('en-US', { timeZone: env.appTimezone, month: 'numeric', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' })}`,
      eventKey: `task-${task._id}-${new Date(task.reminderAt).toISOString().slice(0, 16)}`,
      details: {
        	  taskId: task._id,
        title: task.title,
        description: 'Reminder for pending task',
        reminderTime: task.reminderAt,
        deadline: task.deadline,
        status: task.completed ? 'completed' : 'pending'
      }
    });
  }

  const tasksDueNow = await Task.find({
    completed: false,
    deadline: { $gte: now, $lt: reminderWindowEnd }
  }).select('userId title deadline reminderAt completed');

  for (const task of tasksDueNow) {
    await createNotificationIfNotExists({
      userId: task.userId,
      type: 'task-deadline',
      title: 'Task deadline reached',
      message: `${task.title} deadline is now`,
      eventKey: `task-deadline-${task._id}-${new Date(task.deadline).toISOString().slice(0, 16)}`,
      details: {
        taskId: task._id,
        title: task.title,
        description: 'Task deadline reached',
        reminderTime: task.reminderAt,
        deadline: task.deadline,
        status: task.completed ? 'completed' : 'pending'
      }
    });
  }
};

const initializeNotificationJobs = () => {
  cron.schedule('* * * * *', () => {
    Promise.all([runReminderTick(), runClassStartTick()]).catch((error) => {
      console.error('Notification reminder tick failed', error.message);
    });
  });
};

module.exports = { initializeNotificationJobs, createImmediateNotification };