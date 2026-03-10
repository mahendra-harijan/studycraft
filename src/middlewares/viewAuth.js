const jwt = require('jsonwebtoken');
const env = require('../config/env');
const User = require('../models/User');

const requireAuthView = async (req, res, next) => {
  const token = req.cookies.accessToken;
  if (!token) {
    return res.redirect('/login');
  }
  try {
    const payload = jwt.verify(token, env.jwtAccessSecret);
    const user = await User.findById(payload.sub).select('-passwordHash -refreshTokenHash');
    if (!user || !user.isActive) {
      return res.redirect('/login');
    }
    req.user = user;
    return next();
  } catch (error) {
    return res.redirect('/login');
  }
};

module.exports = requireAuthView;