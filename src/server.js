const app = require('./app');
const env = require('./config/env');
const connectDatabase = require('./config/db');
const { initializeNotificationJobs } = require('./services/notificationService');

const start = async () => {
  await connectDatabase();
  initializeNotificationJobs();
  app.listen(env.port, () => {
    console.log(`Study Craft running on http://localhost:${env.port}`);
  });
};

start().catch((error) => {
  console.error('Failed to start application', error);
  process.exit(1);
});