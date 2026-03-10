// ========== CRYPTO CALCULATOR STATE ==========
let currentField = 'a'; // Which field (a, b, n) is currently active
let currentOperation = 'modExp'; // Current selected operation

// ========== INPUT FIELD MANAGEMENT ==========
function setCurrentField(field) {
  currentField = field;
  // Highlight the active field
  document.querySelectorAll('.crypto-input').forEach(input => {
    input.style.borderColor = 'rgba(102, 126, 234, 0.3)';
  });
  document.getElementById('crypto' + field.toUpperCase()).style.borderColor = 'rgba(255, 165, 0, 0.8)';
}

function setOperation(operation) {
  currentOperation = operation;
}

// ========== NUMERIC PAD FUNCTIONS ==========
function cryptoAppendNumber(num) {
  const input = document.getElementById('crypto' + currentField.toUpperCase());
  input.value += num;
}

function cryptoDeleteLast() {
  const input = document.getElementById('crypto' + currentField.toUpperCase());
  input.value = input.value.slice(0, -1);
}

function cryptoClear() {
  document.getElementById('cryptoA').value = '';
  document.getElementById('cryptoB').value = '';
  document.getElementById('cryptoN').value = '';
  document.getElementById('cryptoResult').textContent = '';
  currentField = 'a';
  setCurrentField('a');
}

// ========== MAIN EXECUTION FUNCTION ==========
async function executeCryptoOperation() {
  try {
    const resultDiv = document.getElementById('cryptoResult');
    resultDiv.textContent = 'Calculating...';

    const payload = {
      operation: currentOperation,
      a: document.getElementById('cryptoA').value || '0',
      b: document.getElementById('cryptoB').value || '0',
      n: document.getElementById('cryptoN').value || '1'
    };

    // Validate inputs
    if (!payload.a || isNaN(payload.a)) {
      resultDiv.textContent = 'Error: Invalid value for a';
      return;
    }

    const response = await window.EngineerHub.requestJSON('/api/tools/crypto', {
      method: 'POST',
      body: JSON.stringify(payload)
    });

    // Format the result nicely
    if (response.data && response.data.result !== undefined) {
      const result = response.data.result;
      if (typeof result === 'object') {
        resultDiv.textContent = JSON.stringify(result, null, 2);
      } else {
        resultDiv.textContent = `Result: ${result}`;
      }
    } else {
      resultDiv.textContent = JSON.stringify(response, null, 2);
    }
  } catch (error) {
    const resultDiv = document.getElementById('cryptoResult');
    resultDiv.textContent = `Error: ${error.message || 'Calculation failed'}`;
    console.error('Crypto operation error:', error);
  }
}

// ========== INITIALIZATION ==========
document.addEventListener('DOMContentLoaded', function() {
  // Set initial field
  setCurrentField('a');

  // Allow Enter key to execute calculation
  document.querySelectorAll('.crypto-input').forEach(input => {
    input.addEventListener('keypress', function(e) {
      if (e.key === 'Enter') {
        executeCryptoOperation();
      }
    });
    
    // Update current field when input is focused
    input.addEventListener('focus', function() {
      const field = this.id.replace('crypto', '').toLowerCase();
      setCurrentField(field);
    });
  });

  // Execute button click
  const executeBtn = document.getElementById('cryptoRun');
  if (executeBtn) {
    executeBtn.addEventListener('click', executeCryptoOperation);
  }
});