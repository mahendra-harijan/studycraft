const jwt = require('jsonwebtoken');
const env = require('../config/env');
const User = require('../models/User');
const ApiError = require('../utils/ApiError');

const protect = async (req, res, next) => {
  const accessToken = req.cookies.accessToken;
  if (!accessToken) {
    return next(new ApiError(401, 'Authentication required'));
  }

  try {
    const payload = jwt.verify(accessToken, env.jwtAccessSecret);
    const user = await User.findById(payload.sub).select('-passwordHash -refreshTokenHash');
    if (!user || !user.isActive) {
      return next(new ApiError(401, 'Invalid authentication state'));
    }
    req.user = user;
    return next();
  } catch (error) {
    return next(new ApiError(401, 'Invalid or expired token'));
  }
};

module.exports = { protect };