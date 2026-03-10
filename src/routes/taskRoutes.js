const express = require('express');
const { protect } = require('../middlewares/auth');
const validate = require('../middlewares/validate');
const { taskCreateValidator, taskUpdateValidator, taskIdValidator } = require('../validators/taskValidators');
const { getAll, create, update, remove } = require('../controllers/taskController');

const router = express.Router();

router.use(protect);
router.get('/', getAll);
router.post('/', taskCreateValidator, validate, create);
router.put('/:id', taskUpdateValidator, validate, update);
router.delete('/:id', taskIdValidator, validate, remove);

module.exports = router;