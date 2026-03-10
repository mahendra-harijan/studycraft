const ApiError = require('../utils/ApiError');

const exposeCsrfToken = (req, res, next) => {
  try {
    res.locals.csrfToken = req.csrfToken();
    return next();
  } catch (error) {
    return next(new ApiError(403, 'Invalid CSRF token state'));
  }
};

module.exports = exposeCsrfToken;