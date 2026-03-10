(() => {
  'use strict';

  let currentInput = '0';
  let previousInput = '';
  let operator = null;
  let expression = '';
  let lastResult = 0;
  let angleMode = 'deg';

  const byId = (id) => document.getElementById(id);

  const updateDisplay = () => {
    const resultEl = byId('result');
    const expressionEl = byId('expression');
    if (resultEl) resultEl.textContent = currentInput;
    if (expressionEl) expressionEl.textContent = expression || ' ';
  };

  const getDisplayOperator = (op) => {
    switch (op) {
      case '/': return '÷';
      case '*': return '×';
      case '-': return '−';
      case '+': return '+';
      default: return op;
    }
  };

  const clearAll = () => {
    currentInput = '0';
    previousInput = '';
    operator = null;
    expression = '';
    updateDisplay();
  };

  const clearEntry = () => {
    currentInput = '0';
    updateDisplay();
  };

  const showToast = (message, type = 'info') => {
    const toast = document.createElement('div');
    toast.style.cssText = `
      position: fixed;
      top: 100px;
      right: 20px;
      background: ${type === 'success' ? '#10b981' : '#667eea'};
      color: white;
      padding: 12px 20px;
      border-radius: 10px;
      box-shadow: 0 5px 15px rgba(0,0,0,0.2);
      z-index: 9999;
      animation: slideInRight 0.3s ease;
    `;
    toast.textContent = message;
    document.body.appendChild(toast);

    setTimeout(() => {
      toast.style.animation = 'slideOutRight 0.3s ease';
      setTimeout(() => toast.remove(), 300);
    }, 2000);
  };

  const showError = (message) => {
    currentInput = 'Error';
    expression = message;
    updateDisplay();
    setTimeout(() => {
      clearAll();
    }, 1500);
  };

  const appendNumber = (num) => {
    if (currentInput === '0' || currentInput === 'Error') {
      currentInput = num;
    } else {
      currentInput += num;
    }
    updateDisplay();
  };

  const appendDecimal = () => {
    if (!currentInput.includes('.')) {
      currentInput += '.';
    }
    updateDisplay();
  };

  const appendOperator = (op) => {
    if (operator !== null && previousInput !== '' && currentInput !== '') {
      calculate();
    }

    if (currentInput !== '' && currentInput !== 'Error') {
      previousInput = currentInput;
      operator = op;
      expression = `${previousInput} ${getDisplayOperator(op)} `;
      currentInput = '0';
    }
    updateDisplay();
  };

  const appendFunction = (func) => {
    const num = parseFloat(currentInput);

    if (Number.isNaN(num)) {
      showError('Invalid input');
      return;
    }

    switch (func) {
      case '1/x':
        if (num === 0) {
          showError('Cannot divide by zero');
          return;
        }
        currentInput = (1 / num).toString();
        expression = `1/(${num}) =`;
        break;

      case '10^n':
        currentInput = Math.pow(10, num).toString();
        expression = `10^${num} =`;
        break;

      case 'x²':
        currentInput = (num * num).toString();
        expression = `sqr(${num}) =`;
        break;

      case 'x³':
        currentInput = (num * num * num).toString();
        expression = `cube(${num}) =`;
        break;

      case 'sqrt':
        if (num < 0) {
          showError('Cannot calculate square root of negative number');
          return;
        }
        currentInput = Math.sqrt(num).toString();
        expression = `√(${num}) =`;
        break;

      case 'sqrtn': {
        const n = window.prompt('Enter root value (n):', '2');
        if (n && !Number.isNaN(Number.parseFloat(n)) && Number.parseFloat(n) > 0) {
          if (num < 0 && Number.parseFloat(n) % 2 === 0) {
            showError('Cannot calculate even root of negative number');
            return;
          }
          currentInput = Math.pow(num, 1 / Number.parseFloat(n)).toString();
          expression = `√[${n}](${num}) =`;
        }
        break;
      }

      case 'x^n': {
        const exponent = window.prompt('Enter exponent:', '2');
        if (exponent && !Number.isNaN(Number.parseFloat(exponent))) {
          currentInput = Math.pow(num, Number.parseFloat(exponent)).toString();
          expression = `${num}^${exponent} =`;
        }
        break;
      }

      case 'mod':
        if (operator === null) {
          previousInput = currentInput;
          operator = '%';
          expression = `${previousInput} % `;
          currentInput = '0';
        }
        break;

      default:
        break;
    }

    lastResult = Number.parseFloat(currentInput);
    updateDisplay();
  };

  const appendAns = () => {
    currentInput = lastResult.toString();
    updateDisplay();
  };

  const calculate = () => {
    if (operator === null || previousInput === '' || currentInput === '') {
      return;
    }

    let result;
    const prev = Number.parseFloat(previousInput);
    const curr = Number.parseFloat(currentInput);

    if (Number.isNaN(prev) || Number.isNaN(curr)) {
      showError('Invalid input');
      return;
    }

    try {
      switch (operator) {
        case '+':
          result = prev + curr;
          break;
        case '-':
          result = prev - curr;
          break;
        case '*':
          result = prev * curr;
          break;
        case '/':
          if (curr === 0) {
            showError('Cannot divide by zero');
            return;
          }
          result = prev / curr;
          break;
        case '%':
          result = prev % curr;
          break;
        default:
          return;
      }

      result = Math.round(result * 1e10) / 1e10;
      expression = `${previousInput} ${getDisplayOperator(operator)} ${currentInput} =`;
      currentInput = result.toString();
      lastResult = result;
      previousInput = '';
      operator = null;
    } catch {
      showError('Calculation error');
      clearAll();
    }

    updateDisplay();
  };

  const toggleAngleMode = () => {
    angleMode = angleMode === 'deg' ? 'rad' : 'deg';
    const angleModeEl = byId('angleMode');
    if (angleModeEl) {
      angleModeEl.textContent = angleMode.toUpperCase();
    }
    showToast(`Mode changed to ${angleMode.toUpperCase()}`, 'info');
  };

  const handleButtonClick = (button) => {
    const action = button.dataset.action;
    const value = button.dataset.value;

    if (!action) return;

    switch (action) {
      case 'number':
        appendNumber(value);
        break;
      case 'decimal':
        appendDecimal();
        break;
      case 'operator':
        appendOperator(value);
        break;
      case 'function':
        appendFunction(value);
        break;
      case 'clear-entry':
        clearEntry();
        break;
      case 'clear-all':
        clearAll();
        break;
      case 'calculate':
        calculate();
        break;
      case 'ans':
        appendAns();
        break;
      default:
        break;
    }
  };

  const bindEvents = () => {
    byId('angleMode')?.addEventListener('click', toggleAngleMode);

    document.querySelector('.calculator-buttons')?.addEventListener('click', (event) => {
      const button = event.target.closest('button[data-action]');
      if (!button) return;
      handleButtonClick(button);
    });

    document.addEventListener('keydown', (event) => {
      const key = event.key;

      if (key >= '0' && key <= '9') {
        appendNumber(key);
      } else if (key === '.') {
        appendDecimal();
      } else if (key === '+' || key === '-' || key === '*' || key === '/') {
        event.preventDefault();
        appendOperator(key);
      } else if (key === 'Enter' || key === '=') {
        event.preventDefault();
        calculate();
      } else if (key === 'Escape') {
        clearAll();
      } else if (key === 'Backspace') {
        if (currentInput.length > 1) {
          currentInput = currentInput.slice(0, -1);
        } else {
          currentInput = '0';
        }
        updateDisplay();
      }
    });
  };

  const addToastAnimations = () => {
    const style = document.createElement('style');
    style.textContent = `
      @keyframes slideInRight {
        from { opacity: 0; transform: translateX(100%); }
        to { opacity: 1; transform: translateX(0); }
      }
      @keyframes slideOutRight {
        from { opacity: 1; transform: translateX(0); }
        to { opacity: 0; transform: translateX(100%); }
      }
    `;
    document.head.appendChild(style);
  };

  document.addEventListener('DOMContentLoaded', () => {
    bindEvents();
    addToastAnimations();
    updateDisplay();
  });
})();
