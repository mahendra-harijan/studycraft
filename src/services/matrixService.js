const ApiError = require('../utils/ApiError');

const toNumber = (value) => {
  const num = Number(value);
  if (!Number.isFinite(num)) {
    throw new ApiError(422, 'Invalid matrix number');
  }
  return num;
};

const normalize = (matrix) => matrix.map((row) => row.map(toNumber));

const dimensions = (matrix) => ({ rows: matrix.length, cols: matrix[0]?.length || 0 });

const sameShape = (a, b) => dimensions(a).rows === dimensions(b).rows && dimensions(a).cols === dimensions(b).cols;

const add = (a, b, sign = 1) => a.map((row, i) => row.map((v, j) => v + sign * b[i][j]));

const multiply = (a, b) => {
  const da = dimensions(a);
  const db = dimensions(b);
  if (da.cols !== db.rows) throw new ApiError(422, 'Dimension mismatch for multiplication');
  const result = Array.from({ length: da.rows }, () => Array(db.cols).fill(0));
  for (let i = 0; i < da.rows; i += 1) {
    for (let j = 0; j < db.cols; j += 1) {
      for (let k = 0; k < da.cols; k += 1) {
        result[i][j] += a[i][k] * b[k][j];
      }
    }
  }
  return result;
};

const transpose = (m) => m[0].map((_, colIdx) => m.map((row) => row[colIdx]));

const minor = (m, row, col) => m.filter((_, r) => r !== row).map((r) => r.filter((_, c) => c !== col));

const determinant = (m) => {
  const d = dimensions(m);
  if (d.rows !== d.cols) throw new ApiError(422, 'Determinant requires a square matrix');
  if (d.rows === 1) return m[0][0];
  if (d.rows === 2) return m[0][0] * m[1][1] - m[0][1] * m[1][0];
  let det = 0;
  for (let c = 0; c < d.cols; c += 1) {
    det += (c % 2 === 0 ? 1 : -1) * m[0][c] * determinant(minor(m, 0, c));
  }
  return det;
};

const adjugate = (m) => {
  const d = dimensions(m);
  if (d.rows !== d.cols) throw new ApiError(422, 'Adjugate requires square matrix');
  const cof = m.map((row, i) => row.map((_, j) => ((i + j) % 2 === 0 ? 1 : -1) * determinant(minor(m, i, j))));
  return transpose(cof);
};

const inverse = (m) => {
  const det = determinant(m);
  if (det === 0) throw new ApiError(422, 'Matrix is non-invertible (determinant = 0)');
  const adj = adjugate(m);
  return adj.map((row) => row.map((v) => v / det));
};

const executeMatrixOperation = (operation, matrixA, matrixB) => {
  const a = normalize(matrixA);
  const b = matrixB ? normalize(matrixB) : null;

  if (a.length === 0 || a[0].length === 0) throw new ApiError(422, 'Matrix A cannot be empty');

  switch (operation) {
    case 'add':
      if (!b || !sameShape(a, b)) throw new ApiError(422, 'Dimension mismatch for addition');
      return add(a, b, 1);
    case 'subtract':
      if (!b || !sameShape(a, b)) throw new ApiError(422, 'Dimension mismatch for subtraction');
      return add(a, b, -1);
    case 'multiply':
      if (!b) throw new ApiError(422, 'Matrix B required for multiplication');
      return multiply(a, b);
    case 'divide':
      if (!b) throw new ApiError(422, 'Matrix B required for division');
      return multiply(a, inverse(b));
    case 'transpose':
      return transpose(a);
    case 'adjugate':
      return adjugate(a);
    case 'determinant':
      return determinant(a);
    case 'inverse':
      return inverse(a);
    default:
      throw new ApiError(400, 'Invalid matrix operation');
  }
};

module.exports = { executeMatrixOperation };