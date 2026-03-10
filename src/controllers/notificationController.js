const asyncHandler = require('../middlewares/asyncHandler');
const Notification = require('../models/Notification');
const Task = require('../models/Task');
const ApiError = require('../utils/ApiError');
const {
  isConfigured,
  getPublicVapidKey,
  saveSubscription,
  removeSubscription
} = require('../services/webPushService');

const listNotifications = asyncHandler(async (req, res) => {
  const items = await Notification.find({ userId: req.user._id }).sort({ deliveredAt: -1 }).limit(50);
  res.status(200).json({ success: true, data: items });
});

const markRead = asyncHandler(async (req, res) => {
  await Notification.updateMany({ userId: req.user._id, read: false }, { $set: { read: true } });
  await Task.deleteMany({ userId: req.user._id, completed: true, deadline: { $lt: new Date() } });
  await Notification.deleteMany({ userId: req.user._id });
  res.status(200).json({ success: true, message: 'Notifications marked as read and cleared' });
});

const deleteNotification = asyncHandler(async (req, res) => {
  const deleted = await Notification.findOneAndDelete({ _id: req.params.id, userId: req.user._id });
  if (!deleted) {
    throw new ApiError(404, 'Notification not found');
  }
  res.status(200).json({ success: true, message: 'Notification deleted' });
});

const getVapidPublicKey = asyncHandler(async (req, res) => {
  if (!isConfigured()) {
    throw new ApiError(503, 'Web push is not configured on server');
  }
  res.status(200).json({ success: true, data: { publicKey: getPublicVapidKey() } });
});

const subscribePush = asyncHandler(async (req, res) => {
  if (!isConfigured()) {
    throw new ApiError(503, 'Web push is not configured on server');
  }

  await saveSubscription({
    userId: req.user._id,
    subscription: req.body.subscription,
    userAgent: req.headers['user-agent'] || ''
  });

  res.status(200).json({ success: true, message: 'Push subscription saved' });
});

const unsubscribePush = asyncHandler(async (req, res) => {
  await removeSubscription({
    userId: req.user._id,
    endpoint: req.body.endpoint
  });

  res.status(200).json({ success: true, message: 'Push subscription removed' });
});

module.exports = {
  listNotifications,
  markRead,
  deleteNotification,
  getVapidPublicKey,
  subscribePush,
  unsubscribePush
};