const jwt = require('jsonwebtoken');
const env = require('../config/env');
const User = require('../models/User');
const {
  createAccessToken,
  createRefreshToken,
  hashToken,
  compareToken,
  setAuthCookies
} = require('../services/tokenService');

const tryRefreshSession = async (req, res) => {
  const refreshToken = req.cookies.refreshToken;
  if (!refreshToken) {
    return null;
  }

  let refreshPayload;
  try {
    refreshPayload = jwt.verify(refreshToken, env.jwtRefreshSecret);
  } catch (error) {
    return null;
  }

  const user = await User.findById(refreshPayload.sub).select('-passwordHash +refreshTokenHash');
  if (!user || !user.isActive || !user.refreshTokenHash) {
    return null;
  }

  const tokenMatches = await compareToken(refreshToken, user.refreshTokenHash);
  if (!tokenMatches) {
    return null;
  }

  const newAccessToken = createAccessToken(user._id);
  const newRefreshToken = createRefreshToken(user._id);
  user.refreshTokenHash = await hashToken(newRefreshToken);
  await user.save();

  setAuthCookies(res, newAccessToken, newRefreshToken);
  return user;
};

const requireAuthView = async (req, res, next) => {
  const token = req.cookies.accessToken;

  try {
    if (!token) {
      const refreshedUser = await tryRefreshSession(req, res);
      if (!refreshedUser) {
        return res.redirect('/login');
      }
      req.user = refreshedUser;
      return next();
    }

    const payload = jwt.verify(token, env.jwtAccessSecret);
    const user = await User.findById(payload.sub).select('-passwordHash -refreshTokenHash');
    if (!user || !user.isActive) {
      return res.redirect('/login');
    }
    req.user = user;
    return next();
  } catch (error) {
    const refreshedUser = await tryRefreshSession(req, res);
    if (refreshedUser) {
      req.user = refreshedUser;
      return next();
    }
    return res.redirect('/login');
  }
};

module.exports = requireAuthView;