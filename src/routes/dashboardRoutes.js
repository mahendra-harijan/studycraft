const express = require('express');
const { protect } = require('../middlewares/auth');
const { getOverview } = require('../controllers/dashboardController');

const router = express.Router();

router.get('/overview', protect, getOverview);

module.exports = router;