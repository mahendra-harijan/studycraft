const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const env = require('../config/env');

const parseDurationToMs = (value, fallbackMs) => {
  if (typeof value === 'number' && Number.isFinite(value)) {
    return Math.max(value * 1000, 1000);
  }

  if (typeof value !== 'string') {
    return fallbackMs;
  }

  const trimmed = value.trim();
  if (!trimmed) {
    return fallbackMs;
  }

  if (/^\d+$/.test(trimmed)) {
    return Math.max(Number(trimmed) * 1000, 1000);
  }

  const match = trimmed.match(/^(\d+)\s*(ms|s|m|h|d|w)$/i);
  if (!match) {
    return fallbackMs;
  }

  const amount = Number(match[1]);
  const unit = match[2].toLowerCase();
  const multiplier = {
    ms: 1,
    s: 1000,
    m: 60 * 1000,
    h: 60 * 60 * 1000,
    d: 24 * 60 * 60 * 1000,
    w: 7 * 24 * 60 * 60 * 1000
  }[unit];

  if (!multiplier) {
    return fallbackMs;
  }

  return Math.max(amount * multiplier, 1000);
};

const accessCookieMaxAgeMs = parseDurationToMs(env.jwtAccessExpiresIn, 15 * 60 * 1000);
const refreshCookieMaxAgeMs = parseDurationToMs(env.jwtRefreshExpiresIn, 7 * 24 * 60 * 60 * 1000);

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
    maxAge: accessCookieMaxAgeMs
  });
  res.cookie('refreshToken', refreshToken, {
    ...cookieBase,
    maxAge: refreshCookieMaxAgeMs
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