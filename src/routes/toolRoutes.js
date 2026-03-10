const express = require('express');
const validate = require('../middlewares/validate');
const { matrixValidator, cryptoValidator } = require('../validators/toolValidators');
const { matrix, crypto } = require('../controllers/toolController');

const router = express.Router();

router.post('/matrix', matrixValidator, validate, matrix);
router.post('/crypto', cryptoValidator, validate, crypto);

module.exports = router;