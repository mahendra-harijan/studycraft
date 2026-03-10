const asyncHandler = require('../middlewares/asyncHandler');
const Schedule = require('../models/Schedule');
const Task = require('../models/Task');
const Notification = require('../models/Notification');
const { minutesToTime } = require('../utils/time');

const getDayName = () =>
  ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][new Date().getDay()];

const dayList = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

const mapUpcomingTask = (task) => ({
  id: task._id,
  title: task.title,
  deadline: task.deadline,
  priority: task.priority,
  completed: task.completed
});

const getOverview = asyncHandler(async (req, res) => {
  const requestedDay = typeof req.query.day === 'string' ? req.query.day.trim() : '';
  const today = dayList.includes(requestedDay) ? requestedDay : getDayName();
  const now = new Date();
  
  // Get start and end of current day for task filtering
  const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0);
  const endOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);

  const [classesToday, upcomingTasks, todayDeadlineCount, unreadCount, totalSchedules, totalTasks, pendingTasksCount] = await Promise.all([
    Schedule.find({ userId: req.user._id, day: today }).sort({ startMinutes: 1 }).limit(10),
    Task.find({ 
      userId: req.user._id, 
      completed: false, 
      deadline: { $gte: now }
    }).sort({ deadline: 1 }).limit(10),
    Task.countDocuments({
      userId: req.user._id,
      completed: false,
      deadline: { $gte: startOfDay, $lte: endOfDay }
    }),
    Notification.countDocuments({ userId: req.user._id, read: false }),
    Schedule.countDocuments({ userId: req.user._id }),
    Task.countDocuments({ userId: req.user._id }),
    Task.countDocuments({ userId: req.user._id, completed: false })
  ]);

  const storageUsagePercent = Math.min(100, Math.round((totalSchedules * 1.8 + totalTasks * 1.2) % 100));

  res.status(200).json({
    success: true,
    data: {
      classesToday: classesToday.map((item) => ({
        id: item._id,
        subject: item.subject,
        time: `${minutesToTime(item.startMinutes)} - ${minutesToTime(item.endMinutes)}`,
        venue: item.venue
      })),
      upcomingTasks: upcomingTasks.map(mapUpcomingTask),
      unreadCount,
      storageUsagePercent,
      pendingTasksCount,
      todayDeadlineCount
    }
  });
});

module.exports = { getOverview };