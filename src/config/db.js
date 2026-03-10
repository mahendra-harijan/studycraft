const mongoose = require('mongoose');
const env = require('./env');

const connectDatabase = async () => {
  await mongoose.connect(env.mongoUri, {
    autoIndex: false
  });
};

module.exports = connectDatabase;