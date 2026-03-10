const express = require('express');
const { protect } = require('../middlewares/auth');
const validate = require('../middlewares/validate');
const { scheduleCreateValidator, scheduleUpdateValidator, scheduleIdValidator } = require('../validators/scheduleValidators');
const { getAll, create, update, remove } = require('../controllers/scheduleController');

const router = express.Router();

router.use(protect);
router.get('/', getAll);
router.post('/', scheduleCreateValidator, validate, create);
router.put('/:id', scheduleUpdateValidator, validate, update);
router.delete('/:id', scheduleIdValidator, validate, remove);

module.exports = router;