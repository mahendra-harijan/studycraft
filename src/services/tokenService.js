const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const env = require('../config/env');

const cookieBase = {
  httpOnly: true,
  secure: env.cookieSecure,
  sameSite: 'strict',
  path: '/'
};

const createAccessToken = (userId) =>
  jwt.sign({ sub: String(userId), tokenType: 'access' }, env.jwtAccessSecret, {
    expiresIn: env.jwtAccessExpiresIn,
    issuer: 'engineerhub'
  });

const createRefreshToken = (userId) =>
  jwt.sign({ sub: String(userId), tokenType: 'refresh' }, env.jwtRefreshSecret, {
    expiresIn: env.jwtRefreshExpiresIn,
    issuer: 'engineerhub'
  });

const hashToken = async (token) => bcrypt.hash(token, 12);
const compareToken = async (plainToken, hash) => bcrypt.compare(plainToken, hash);

const setAuthCookies = (res, accessToken, refreshToken) => {
  res.cookie('accessToken', accessToken, {
    ...cookieBase,
    maxAge: 15 * 60 * 1000
  });
  res.cookie('refreshToken', refreshToken, {
    ...cookieBase,
    maxAge: 7 * 24 * 60 * 60 * 1000
  });
};

const clearAuthCookies = (res) => {
  res.clearCookie('accessToken', cookieBase);
  res.clearCookie('refreshToken', cookieBase);
};

module.exports = {
  createAccessToken,
  createRefreshToken,
  hashToken,
  compareToken,
  setAuthCookies,
  clearAuthCookies
};