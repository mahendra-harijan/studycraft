const multer = require('multer');
const path = require('path');
const env = require('../config/env');
const ApiError = require('../utils/ApiError');

const allowedMimes = ['image/jpeg', 'image/png', 'image/webp'];
const allowedExtensions = new Set(['.jpg', '.jpeg', '.png', '.webp']);

const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  const ext = path.extname(file.originalname || '').toLowerCase();
  if (!allowedMimes.includes(file.mimetype) || !allowedExtensions.has(ext)) {
    return cb(new ApiError(400, 'Invalid file type. Only JPG, PNG, WEBP allowed.'));
  }
  return cb(null, true);
};

const uploadAvatar = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: env.maxFileSizeMb * 1024 * 1024,
    files: 1
  }
});

module.exports = { uploadAvatar };