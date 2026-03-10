const express = require('express');
const validate = require('../middlewares/validate');
const { contactLimiter } = require('../middlewares/rateLimiters');
const { sendContactMessage } = require('../controllers/contactController');
const { sendContactValidator } = require('../validators/contactValidators');

const router = express.Router();

router.post('/', contactLimiter, sendContactValidator, validate, sendContactMessage);

module.exports = router;
