const express = require('express');
const validate = require('../middlewares/validate');
const { authLimiter } = require('../middlewares/rateLimiters');
const { protect } = require('../middlewares/auth');
const { uploadAvatar } = require('../middlewares/upload');
const { signupValidator, loginValidator, profileValidator } = require('../validators/authValidators');
const { signup, login, refresh, logout, me, updateProfile } = require('../controllers/authController');

const router = express.Router();

router.post('/signup', authLimiter, signupValidator, validate, signup);
router.post('/login', authLimiter, loginValidator, validate, login);
router.post('/refresh', refresh);
router.post('/logout', logout);
router.get('/me', protect, me);
router.patch('/profile', protect, uploadAvatar.single('avatar'), profileValidator, validate, updateProfile);

module.exports = router;