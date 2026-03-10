(() => {
  'use strict';

  const opNames = {
    add: 'Addition',
    subtract: 'Subtraction',
    multiply: 'Multiplication',
    transpose: 'Transpose',
    determinant: 'Determinant',
    inverse: 'Inverse',
    adjugate: 'Adjugate'
  };

  const resultLabels = {
    add: 'Sum of Matrices',
    subtract: 'Difference of Matrices',
    multiply: 'Product of Matrices',
    transpose: 'Transposed Matrix',
    determinant: 'Determinant Value',
    inverse: 'Inverse Matrix',
    adjugate: 'Adjugate Matrix'
  };

  const binaryOps = ['add', 'subtract', 'multiply'];

  let currentOperation = 'add';
  let matrixARows = 2;
  let matrixACols = 2;
  let matrixBRows = 2;
  let matrixBCols = 2;

  const byId = (id) => document.getElementById(id);

  function init() {
    bindOperationButtons();
    bindActionButtons();
    bindGridInputListeners();
    setOperation('add');
  }

  function bindOperationButtons() {
    document.querySelectorAll('.operation-btn').forEach((button) => {
      button.addEventListener('click', () => {
        const op = button.id.replace('op-', '');
        if (!opNames[op]) return;
        setOperation(op);
      });
    });
  }

  function bindActionButtons() {
    byId('calculateBtn')?.addEventListener('click', calculateMatrix);
    byId('resetBtn')?.addEventListener('click', resetCalculator);
  }

  function bindDimensionListeners() {
    byId('matrixARows')?.addEventListener('change', updateMatrixADimensions);
    byId('matrixACols')?.addEventListener('change', updateMatrixADimensions);
    byId('matrixBRows')?.addEventListener('change', updateMatrixBDimensions);
    byId('matrixBCols')?.addEventListener('change', updateMatrixBDimensions);
  }

  function bindGridInputListeners() {
    byId('matrixAGrid')?.addEventListener('input', (event) => {
      const input = event.target.closest('input[data-matrix="A"]');
      if (!input) return;
      const row = Number(input.dataset.row);
      const col = Number(input.dataset.col);
      input.dataset.value = String(Number.parseFloat(input.value) || 0);
      if (Number.isNaN(row) || Number.isNaN(col)) return;
    });

    byId('matrixBGrid')?.addEventListener('input', (event) => {
      const input = event.target.closest('input[data-matrix="B"]');
      if (!input) return;
      const row = Number(input.dataset.row);
      const col = Number(input.dataset.col);
      input.dataset.value = String(Number.parseFloat(input.value) || 0);
      if (Number.isNaN(row) || Number.isNaN(col)) return;
    });
  }

  function setOperation(op) {
    currentOperation = op;

    document.querySelectorAll('.operation-btn').forEach((btn) => btn.classList.remove('active'));
    byId(`op-${op}`)?.classList.add('active');

    const selectedOperation = byId('selectedOperation');
    if (selectedOperation) selectedOperation.textContent = opNames[op] || 'Operation';

    const matrixBCard = byId('matrixBCard');
    if (matrixBCard) matrixBCard.style.display = binaryOps.includes(op) ? 'block' : 'none';

    renderDimensionControls();
    generateMatrixA();
    if (binaryOps.includes(op)) {
      generateMatrixB();
    }

    byId('resultCard').style.display = 'none';
  }

  function renderDimensionControls() {
    const container = byId('dimensionControls');
    if (!container) return;

    if (binaryOps.includes(currentOperation)) {
      container.innerHTML = `
        <div class="col-md-6">
          <div class="dimension-control">
            <div class="dimension-label">
              <i class="fas fa-arrow-right me-2 text-primary"></i>Matrix A Dimensions
            </div>
            <div class="row g-3">
              <div class="col-6">
                <label class="form-label small">Rows</label>
                <select class="dimension-select" id="matrixARows">
                  <option value="1">1</option>
                  <option value="2" selected>2</option>
                  <option value="3">3</option>
                  <option value="4">4</option>
                  <option value="5">5</option>
                </select>
              </div>
              <div class="col-6">
                <label class="form-label small">Columns</label>
                <select class="dimension-select" id="matrixACols">
                  <option value="1">1</option>
                  <option value="2" selected>2</option>
                  <option value="3">3</option>
                  <option value="4">4</option>
                  <option value="5">5</option>
                </select>
              </div>
            </div>
          </div>
        </div>
        <div class="col-md-6">
          <div class="dimension-control">
            <div class="dimension-label">
              <i class="fas fa-arrow-right me-2 text-primary"></i>Matrix B Dimensions
            </div>
            <div class="row g-3">
              <div class="col-6">
                <label class="form-label small">Rows</label>
                <select class="dimension-select" id="matrixBRows">
                  <option value="1">1</option>
                  <option value="2" selected>2</option>
                  <option value="3">3</option>
                  <option value="4">4</option>
                  <option value="5">5</option>
                </select>
              </div>
              <div class="col-6">
                <label class="form-label small">Columns</label>
                <select class="dimension-select" id="matrixBCols">
                  <option value="1">1</option>
                  <option value="2" selected>2</option>
                  <option value="3">3</option>
                  <option value="4">4</option>
                  <option value="5">5</option>
                </select>
              </div>
            </div>
          </div>
        </div>
      `;
    } else {
      container.innerHTML = `
        <div class="col-md-6 mx-auto">
          <div class="dimension-control">
            <div class="dimension-label">
              <i class="fas fa-arrow-right me-2 text-primary"></i>Matrix Dimensions
            </div>
            <div class="row g-3">
              <div class="col-6">
                <label class="form-label small">Rows</label>
                <select class="dimension-select" id="matrixARows">
                  <option value="1">1</option>
                  <option value="2" selected>2</option>
                  <option value="3">3</option>
                  <option value="4">4</option>
                  <option value="5">5</option>
                </select>
              </div>
              <div class="col-6">
                <label class="form-label small">Columns</label>
                <select class="dimension-select" id="matrixACols">
                  <option value="1">1</option>
                  <option value="2" selected>2</option>
                  <option value="3">3</option>
                  <option value="4">4</option>
                  <option value="5">5</option>
                </select>
              </div>
            </div>
          </div>
        </div>
      `;
    }

    byId('matrixARows').value = String(matrixARows);
    byId('matrixACols').value = String(matrixACols);
    if (byId('matrixBRows')) byId('matrixBRows').value = String(matrixBRows);
    if (byId('matrixBCols')) byId('matrixBCols').value = String(matrixBCols);

    bindDimensionListeners();
    syncDimensionLabels();
  }

  function syncDimensionLabels() {
    byId('matrixADim').textContent = `${matrixARows} × ${matrixACols}`;
    if (byId('matrixBDim')) byId('matrixBDim').textContent = `${matrixBRows} × ${matrixBCols}`;
  }

  function updateMatrixADimensions() {
    matrixARows = Number.parseInt(byId('matrixARows')?.value || '2', 10);
    matrixACols = Number.parseInt(byId('matrixACols')?.value || '2', 10);
    syncDimensionLabels();
    generateMatrixA();
  }

  function updateMatrixBDimensions() {
    matrixBRows = Number.parseInt(byId('matrixBRows')?.value || '2', 10);
    matrixBCols = Number.parseInt(byId('matrixBCols')?.value || '2', 10);
    syncDimensionLabels();
    generateMatrixB();
  }

  function buildMatrixGrid(containerId, matrixName, rows, cols) {
    const container = byId(containerId);
    if (!container) return;

    let html = '<table class="matrix-table">';
    for (let i = 0; i < rows; i += 1) {
      html += '<tr>';
      for (let j = 0; j < cols; j += 1) {
        html += `<td><input type="number" class="matrix-input" data-matrix="${matrixName}" data-row="${i}" data-col="${j}" value="0" step="any"></td>`;
      }
      html += '</tr>';
    }
    html += '</table>';
    container.innerHTML = html;
  }

  function generateMatrixA() {
    buildMatrixGrid('matrixAGrid', 'A', matrixARows, matrixACols);
  }

  function generateMatrixB() {
    buildMatrixGrid('matrixBGrid', 'B', matrixBRows, matrixBCols);
  }

  function readMatrixFromGrid(containerId, rows, cols) {
    const container = byId(containerId);
    const matrix = [];
    for (let i = 0; i < rows; i += 1) {
      const row = [];
      for (let j = 0; j < cols; j += 1) {
        const input = container?.querySelector(`input[data-row="${i}"][data-col="${j}"]`);
        row.push(Number.parseFloat(input?.value || '0') || 0);
      }
      matrix.push(row);
    }
    return matrix;
  }

  function validateBeforeCalculate() {
    if (currentOperation === 'multiply' && matrixACols !== matrixBRows) {
      throw new Error('For multiplication, Matrix A columns must equal Matrix B rows');
    }

    if ((currentOperation === 'add' || currentOperation === 'subtract') && (matrixARows !== matrixBRows || matrixACols !== matrixBCols)) {
      throw new Error('Matrices must have the same dimensions for addition/subtraction');
    }

    if ((currentOperation === 'determinant' || currentOperation === 'inverse' || currentOperation === 'adjugate') && matrixARows !== matrixACols) {
      throw new Error('Matrix must be square for determinant/inverse/adjugate');
    }
  }

  async function calculateMatrix() {
    try {
      validateBeforeCalculate();

      const matrixA = readMatrixFromGrid('matrixAGrid', matrixARows, matrixACols);
      const requestBody = { operation: currentOperation, matrixA };
      if (binaryOps.includes(currentOperation)) {
        requestBody.matrixB = readMatrixFromGrid('matrixBGrid', matrixBRows, matrixBCols);
      }

      const calculateBtn = byId('calculateBtn');
      const originalText = calculateBtn.innerHTML;
      calculateBtn.innerHTML = '<span class="spinner-border spinner-border-sm me-2"></span>Calculating...';
      calculateBtn.disabled = true;

      try {
        const response = await window.EngineerHub.requestJSON('/api/tools/matrix', {
          method: 'POST',
          body: JSON.stringify(requestBody)
        });
        displayResult(response.data.result);
      } finally {
        calculateBtn.innerHTML = originalText;
        calculateBtn.disabled = false;
      }
    } catch (error) {
      showAlert('danger', error.message || 'Calculation failed');
    }
  }

  function displayResult(result) {
    const resultCard = byId('resultCard');
    const matrixResult = byId('matrixResult');
    const scalarResult = byId('scalarResult');

    resultCard.style.display = 'block';

    if (Array.isArray(result)) {
      matrixResult.style.display = 'block';
      scalarResult.style.display = 'none';

      let html = '<table class="matrix-table">';
      for (let i = 0; i < result.length; i += 1) {
        html += '<tr>';
        for (let j = 0; j < result[i].length; j += 1) {
          const value = typeof result[i][j] === 'number' ? result[i][j].toFixed(4) : result[i][j];
          html += `<td>${value}</td>`;
        }
        html += '</tr>';
      }
      html += '</table>';

      matrixResult.innerHTML = html;
      byId('resultSubtitle').textContent = 'Result Matrix';
    } else {
      matrixResult.style.display = 'none';
      scalarResult.style.display = 'block';
      scalarResult.innerHTML = `<div class="scalar-value">${Number(result).toFixed(4)}</div><div class="scalar-label">${resultLabels[currentOperation] || 'Result'}</div>`;
      byId('resultSubtitle').textContent = resultLabels[currentOperation] || 'Result';
    }
  }

  function resetCalculator() {
    currentOperation = 'add';
    matrixARows = 2;
    matrixACols = 2;
    matrixBRows = 2;
    matrixBCols = 2;
    setOperation('add');
    byId('resultCard').style.display = 'none';
    showAlert('success', 'Calculator reset');
  }

  function showAlert(type, message) {
    const alertContainer = byId('alertContainer');
    if (!alertContainer) return;
    alertContainer.innerHTML = `
      <div class="alert alert-${type} alert-dismissible fade show" role="alert">
        <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'warning' ? 'exclamation-triangle' : 'exclamation-circle'} me-2"></i>
        ${message}
        <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
      </div>
    `;

    setTimeout(() => {
      alertContainer.innerHTML = '';
    }, 5000);
  }

  document.addEventListener('DOMContentLoaded', init);
})();
