const logError = (error, context = {}) => {
  const payload = {
    level: 'error',
    message: error.message,
    stack: process.env.NODE_ENV === 'development' ? error.stack : undefined,
    context,
    timestamp: new Date().toISOString()
  };
  console.error(JSON.stringify(payload));
};

module.exports = { logError };