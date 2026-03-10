const express = require('express');
const exposeCsrfToken = require('../middlewares/csrfToken');
const optionalAuth = require('../middlewares/optionalAuth');
const requireAuthView = require('../middlewares/viewAuth');

const router = express.Router();

router.use(optionalAuth);
router.use(exposeCsrfToken);

router.get('/', (req, res) => {
  res.render('pages/index', { title: 'Study Craft - Home', page: 'home' });
});

router.get('/login', (req, res) => {
  res.render('pages/login', { title: 'Study Craft - Login', page: 'login' });
});

router.get('/signup', (req, res) => {
  res.render('pages/signup', { title: 'Study Craft - Signup', page: 'signup' });
});

router.get('/about', (req, res) => {
  const contactState = req.query.contact;
  const reason = req.query.reason;
  let contactFlash = null;

  if (contactState === 'sent') {
    contactFlash = { type: 'success', message: 'Message sent successfully. Thank you for contacting us.' };
  } else if (contactState === 'invalid') {
    contactFlash = { type: 'warning', message: 'Please enter valid contact details and try again.' };
  } else if (contactState === 'config') {
    contactFlash = { type: 'danger', message: 'Mail service is not configured. Please set SMTP settings and try again.' };
  } else if (contactState === 'failed') {
    const reasonMessageMap = {
      auth: 'Email send failed: SMTP authentication failed. Check SMTP username/password.',
      timeout: 'Email send failed: SMTP server timeout. Please try again in a moment.',
      network: 'Email send failed: Network/DNS issue while reaching SMTP server.',
      server: 'Email send failed: Server error while sending message.'
    };
    contactFlash = {
      type: 'danger',
      message: reasonMessageMap[reason] || 'Unable to send message right now. Please try again later.'
    };
  }

  res.render('pages/about', { title: 'Study Craft - About Us', page: 'about', contactFlash });
});

router.get('/dashboard', requireAuthView, (req, res) => {
  res.render('pages/dashboard',
     { title: 'Study Craft - Dashboard', 
        user: req.user,
       page: 'dashboard' });
});

router.get('/scheduler', requireAuthView, (req, res) => {
  res.render('pages/scheduler', { 
    title: 'Study Craft - Scheduler', 
    page: 'scheduler',
    user: req.user 
  });
});

router.get('/tasks', requireAuthView, (req, res) => {
  res.render('pages/tasks', { 
    title: 'Study Craft - Tasks', 
    page: 'tasks',
    user: req.user 
  });
});

router.get('/profile', requireAuthView, (req, res) => {
  res.render('pages/profile', { 
    title: 'Study Craft - Profile', 
    page: 'profile',
    user: req.user 
  });
});

router.get('/calculator', (req, res) => {
  res.render('pages/calculator', { title: 'Study Craft - Scientific Calculator', page: 'calculator' });
});

router.get('/matrix', (req, res) => {
  res.render('pages/matrix', { title: 'Study Craft - Matrix Calculator', page: 'matrix' });
});

router.get('/crypto-calculator', (req, res) => {
  res.render('pages/crypto-calculator', { title: 'Study Craft - Crypto Calculator', page: 'crypto-calculator' });
});

module.exports = router;