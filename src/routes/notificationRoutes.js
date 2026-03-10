const express = require('express');
const { protect } = require('../middlewares/auth');
const validate = require('../middlewares/validate');
const {
	listNotifications,
	markRead,
	deleteNotification,
	getVapidPublicKey,
	subscribePush,
	unsubscribePush
} = require('../controllers/notificationController');
const { subscribeValidator, unsubscribeValidator } = require('../validators/notificationValidators');

const router = express.Router();

router.use(protect);
router.get('/', listNotifications);
router.patch('/read', markRead);
router.delete('/:id', deleteNotification);
router.get('/push/public-key', getVapidPublicKey);
router.post('/push/subscribe', subscribeValidator, validate, subscribePush);
router.post('/push/unsubscribe', unsubscribeValidator, validate, unsubscribePush);

module.exports = router;