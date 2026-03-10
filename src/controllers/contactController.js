const asyncHandler = require('../middlewares/asyncHandler');
const ApiError = require('../utils/ApiError');
const { logError } = require('../utils/logger');
const { isMailConfigured, sendContactEmail } = require('../services/contactService');

const validateContactPayload = ({ name, email, subject, message }) => {
  if (!name || name.trim().length < 2 || name.trim().length > 100) {
    return 'invalid';
  }

  const normalizedEmail = String(email || '').trim();
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(normalizedEmail) || normalizedEmail.length > 150) {
    return 'invalid';
  }

  if (!subject || subject.trim().length < 3 || subject.trim().length > 150) {
    return 'invalid';
  }

  if (!message || message.trim().length < 10 || message.trim().length > 1000) {
    return 'invalid';
  }

  return null;
};

const sendContactMessage = asyncHandler(async (req, res) => {
  if (!isMailConfigured()) {
    throw new ApiError(503, 'Contact service is not configured on server');
  }

  const { name, email, subject, message } = req.body;

  try {
    await sendContactEmail({ name, email, subject, message });

    return res.status(200).json({
      success: true,
      message: 'Message sent successfully'
    });
  } catch (error) {
    logError(error, { feature: 'contact-email', email, subjectLength: subject.length });
    throw new ApiError(502, 'Unable to send message right now. Please try again later.');
  }
});

const sendContactMessageWeb = asyncHandler(async (req, res) => {
  if (!isMailConfigured()) {
    return res.redirect('/about?contact=config');
  }

  const { name, email, subject, message } = req.body;
  const validationIssue = validateContactPayload({ name, email, subject, message });
  if (validationIssue) {
    return res.redirect('/about?contact=invalid');
  }

  try {
    await sendContactEmail({
      name: name.trim(),
      email: email.trim(),
      subject: subject.trim(),
      message: message.trim()
    });

    return res.redirect('/about?contact=sent');
  } catch (error) {
    logError(error, { feature: 'contact-email-web', email, subjectLength: subject.trim().length });

    const errorText = String(error.message || '').toLowerCase();
    if (errorText.includes('auth') || errorText.includes('invalid login')) {
      return res.redirect('/about?contact=failed&reason=auth');
    }

    if (errorText.includes('timed out') || errorText.includes('timeout')) {
      return res.redirect('/about?contact=failed&reason=timeout');
    }

    if (errorText.includes('enotfound') || errorText.includes('eai_again')) {
      return res.redirect('/about?contact=failed&reason=network');
    }

    return res.redirect('/about?contact=failed&reason=server');
  }
});

module.exports = { sendContactMessage, sendContactMessageWeb };
