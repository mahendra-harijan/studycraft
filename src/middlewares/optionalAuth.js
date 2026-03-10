const jwt = require('jsonwebtoken');
const env = require('../config/env');
const User = require('../models/User');

const optionalAuth = async (req, res, next) => {
  try {
    const token = req.cookies.accessToken;
    if (!token) {
      res.locals.currentUser = null;
      return next();
    }
    const payload = jwt.verify(token, env.jwtAccessSecret);
    const user = await User.findById(payload.sub).select('fullName email avatarUrl');
    res.locals.currentUser = user || null;
    return next();
  } catch (error) {
    res.locals.currentUser = null;
    return next();
  }
};

module.exports = optionalAuth;