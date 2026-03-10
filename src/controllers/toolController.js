const asyncHandler = require('../middlewares/asyncHandler');
const { executeMatrixOperation } = require('../services/matrixService');
const { executeCryptoOperation } = require('../services/cryptoService');

const matrix = asyncHandler(async (req, res) => {
  const result = executeMatrixOperation(req.body.operation, req.body.matrixA, req.body.matrixB);
  res.status(200).json({ success: true, data: { result } });
});

const crypto = asyncHandler(async (req, res) => {
  const result = executeCryptoOperation(req.body.operation, req.body);
  res.status(200).json({ success: true, data: { result } });
});

module.exports = { matrix, crypto };