const webPush = require('web-push');
const env = require('../config/env');
const PushSubscription = require('../models/PushSubscription');

const isConfigured = () => Boolean(env.vapidSubject && env.vapidPublicKey && env.vapidPrivateKey);

if (isConfigured()) {
  webPush.setVapidDetails(env.vapidSubject, env.vapidPublicKey, env.vapidPrivateKey);
}

const getPublicVapidKey = () => env.vapidPublicKey;

const saveSubscription = async ({ userId, subscription, userAgent }) => {
  const safeSubscription = {
    endpoint: subscription.endpoint,
    keys: {
      p256dh: subscription.keys.p256dh,
      auth: subscription.keys.auth
    }
  };

  await PushSubscription.findOneAndUpdate(
    { userId, endpoint: safeSubscription.endpoint },
    {
      $set: {
        keys: safeSubscription.keys,
        userAgent: userAgent || ''
      }
    },
    { upsert: true, setDefaultsOnInsert: true, runValidators: true }
  );
};

const removeSubscription = async ({ userId, endpoint }) => {
  await PushSubscription.deleteOne({ userId, endpoint });
};

const sendPushToUser = async ({ userId, title, message, type }) => {
  if (!isConfigured()) {
    return;
  }

  const subscriptions = await PushSubscription.find({ userId }).select('endpoint keys');
  if (!subscriptions.length) {
    return;
  }

  const payload = JSON.stringify({
    title,
    message,
    type,
    timestamp: new Date().toISOString()
  });

  await Promise.all(
    subscriptions.map(async (subscription) => {
      try {
        await webPush.sendNotification(
          {
            endpoint: subscription.endpoint,
            keys: {
              p256dh: subscription.keys.p256dh,
              auth: subscription.keys.auth
            }
          },
          payload
        );
      } catch (error) {
        if (error.statusCode === 404 || error.statusCode === 410) {
          await PushSubscription.deleteOne({ _id: subscription._id });
        }
      }
    })
  );
};

module.exports = {
  isConfigured,
  getPublicVapidKey,
  saveSubscription,
  removeSubscription,
  sendPushToUser
};