const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const cloudinary = require('../config/cloudinary');
const env = require('../config/env');
const asyncHandler = require('../middlewares/asyncHandler');
const User = require('../models/User');
const ApiError = require('../utils/ApiError');
const {
  createAccessToken,
  createRefreshToken,
  hashToken,
  compareToken,
  setAuthCookies,
  clearAuthCookies
} = require('../services/tokenService');

const MAX_FAILED_ATTEMPTS = 5;
const LOCK_MINUTES = 15;

const persistServerSession = (req, userId) => {
  if (!req.session) {
    return;
  }

  req.session.userId = String(userId);
  req.session.isAuthenticated = true;
  req.session.lastSeenAt = new Date().toISOString();
};

const signup = asyncHandler(async (req, res) => {
  const existingUser = await User.findOne({ email: req.body.email });
  if (existingUser) {
    throw new ApiError(409, 'Email already registered');
  }

  const passwordHash = await bcrypt.hash(req.body.password, 12);
  const user = await User.create({
    fullName: req.body.fullName,
    email: req.body.email,
    passwordHash
  });

  const accessToken = createAccessToken(user._id);
  const refreshToken = createRefreshToken(user._id);
  const refreshTokenHash = await hashToken(refreshToken);
  user.refreshTokenHash = refreshTokenHash;
  await user.save();

  persistServerSession(req, user._id);

  setAuthCookies(res, accessToken, refreshToken);
  res.status(201).json({
    success: true,
    message: 'Signup successful',
    data: { fullName: user.fullName, email: user.email }
  });
});

const login = asyncHandler(async (req, res) => {
  const user = await User.findOne({ email: req.body.email }).select('+passwordHash +refreshTokenHash');
  if (!user) {
    throw new ApiError(401, 'Invalid credentials');
  }

  if (user.isLocked()) {
    throw new ApiError(423, 'Account temporarily locked due to failed attempts');
  }

  const isPasswordCorrect = await bcrypt.compare(req.body.password, user.passwordHash);
  if (!isPasswordCorrect) {
    user.failedLoginAttempts += 1;
    if (user.failedLoginAttempts >= MAX_FAILED_ATTEMPTS) {
      user.lockUntil = new Date(Date.now() + LOCK_MINUTES * 60 * 1000);
      user.failedLoginAttempts = 0;
    }
    await user.save();
    throw new ApiError(401, 'Invalid credentials');
  }

  user.failedLoginAttempts = 0;
  user.lockUntil = null;
  const accessToken = createAccessToken(user._id);
  const refreshToken = createRefreshToken(user._id);
  user.refreshTokenHash = await hashToken(refreshToken);
  await user.save();

  persistServerSession(req, user._id);

  setAuthCookies(res, accessToken, refreshToken);
  res.status(200).json({
    success: true,
    message: 'Login successful',
    data: {
      user: {
        id: user._id,
        fullName: user.fullName,
        email: user.email,
        avatarUrl: user.avatarUrl
      }
    }
  });
});

const refresh = asyncHandler(async (req, res) => {
  const oldRefreshToken = req.cookies.refreshToken;
  if (!oldRefreshToken) {
    throw new ApiError(401, 'Refresh token missing');
  }

  let payload;
  try {
    payload = jwt.verify(oldRefreshToken, env.jwtRefreshSecret);
  } catch (error) {
    throw new ApiError(401, 'Invalid refresh token');
  }

  const user = await User.findById(payload.sub).select('+refreshTokenHash');
  if (!user || !user.refreshTokenHash) {
    throw new ApiError(401, 'Refresh session invalid');
  }

  const tokenMatches = await compareToken(oldRefreshToken, user.refreshTokenHash);
  if (!tokenMatches) {
    throw new ApiError(401, 'Refresh session mismatch');
  }

  const accessToken = createAccessToken(user._id);
  const refreshToken = createRefreshToken(user._id);
  user.refreshTokenHash = await hashToken(refreshToken);
  await user.save();

  persistServerSession(req, user._id);

  setAuthCookies(res, accessToken, refreshToken);
  res.status(200).json({ success: true, message: 'Session refreshed' });
});

const logout = asyncHandler(async (req, res) => {
  const token = req.cookies.refreshToken;
  if (token) {
    try {
      const payload = jwt.verify(token, env.jwtRefreshSecret);
      await User.findByIdAndUpdate(payload.sub, { $set: { refreshTokenHash: '' } });
    } catch (error) {
      // intentionally ignored
    }
  }

  if (req.session) {
    req.session.destroy(() => {
      // best-effort cleanup; auth cookies are still cleared below
    });
  }

  clearAuthCookies(res);
  res.status(200).json({ success: true, message: 'Logged out successfully' });
});

const me = asyncHandler(async (req, res) => {
  res.status(200).json({
    success: true,
    data: {
      id: req.user._id,
      fullName: req.user.fullName,
      email: req.user.email,
      avatarUrl: req.user.avatarUrl,
      createdAt: req.user.createdAt
    }
  });
});

const updateProfile = asyncHandler(async (req, res) => {
  const updates = {};
  if (req.body.fullName) {
    updates.fullName = req.body.fullName;
  }

  if (req.file) {
    const uploadResult = await cloudinary.uploader.upload(`data:${req.file.mimetype};base64,${req.file.buffer.toString('base64')}`, {
      folder: 'engineerhub/avatars',
      resource_type: 'image',
      type: 'authenticated',
      overwrite: true,
      transformation: [{ width: 512, height: 512, crop: 'limit' }]
    });
    updates.avatarUrl = uploadResult.secure_url;
  }

  const user = await User.findByIdAndUpdate(req.user._id, { $set: updates }, { new: true, runValidators: true });
  res.status(200).json({
    success: true,
    message: 'Profile updated',
    data: {
      fullName: user.fullName,
      email: user.email,
      avatarUrl: user.avatarUrl
    }
  });
});

module.exports = { signup, login, refresh, logout, me, updateProfile };