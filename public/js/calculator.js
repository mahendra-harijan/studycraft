const expressionInput = document.getElementById('calcExpression');
const calcResult = document.getElementById('calcResult');
const calcRun = document.getElementById('calcRun');
const calcClear = document.getElementById('calcClear');

const operators = {
  '+': { p: 1, f: (a, b) => a + b },
  '-': { p: 1, f: (a, b) => a - b },
  '*': { p: 2, f: (a, b) => a * b },
  '/': { p: 2, f: (a, b) => {
    if (b === 0) throw new Error('Division by zero');
    return a / b;
  } },
  '%': { p: 2, f: (a, b) => {
    if (b === 0) throw new Error('Modulo by zero');
    return a % b;
  } },
  '^': { p: 3, f: (a, b) => a ** b }
};

const funcs = {
  sqrt: Math.sqrt,
  sin: Math.sin,
  cos: Math.cos,
  tan: Math.tan,
  log: Math.log10,
  ln: Math.log
};

const tokenize = (expr) => {
  const cleaned = expr.replace(/\s+/g, '');
  const regex = /(sqrt|sin|cos|tan|log|ln|\d+(?:\.\d+)?|[()+\-*/%^])/g;
  const tokens = cleaned.match(regex) || [];
  if (tokens.join('') !== cleaned) throw new Error('Invalid token in expression');
  return tokens;
};

const toRpn = (tokens) => {
  const output = [];
  const stack = [];
  tokens.forEach((token) => {
    if (!Number.isNaN(Number(token))) {
      output.push(token);
    } else if (funcs[token]) {
      stack.push(token);
    } else if (operators[token]) {
      while (
        stack.length &&
        operators[stack[stack.length - 1]] &&
        operators[stack[stack.length - 1]].p >= operators[token].p
      ) {
        output.push(stack.pop());
      }
      stack.push(token);
    } else if (token === '(') {
      stack.push(token);
    } else if (token === ')') {
      while (stack.length && stack[stack.length - 1] !== '(') {
        output.push(stack.pop());
      }
      if (stack.pop() !== '(') throw new Error('Mismatched parentheses');
      if (stack.length && funcs[stack[stack.length - 1]]) {
        output.push(stack.pop());
      }
    }
  });

  while (stack.length) {
    const op = stack.pop();
    if (op === '(' || op === ')') throw new Error('Mismatched parentheses');
    output.push(op);
  }
  return output;
};

const evalRpn = (tokens) => {
  const stack = [];
  tokens.forEach((token) => {
    if (!Number.isNaN(Number(token))) {
      stack.push(Number(token));
    } else if (operators[token]) {
      const b = stack.pop();
      const a = stack.pop();
      if (a === undefined || b === undefined) throw new Error('Invalid expression');
      stack.push(operators[token].f(a, b));
    } else if (funcs[token]) {
      const value = stack.pop();
      if (value === undefined) throw new Error('Invalid function argument');
      stack.push(funcs[token](value));
    }
  });
  if (stack.length !== 1 || !Number.isFinite(stack[0])) throw new Error('Invalid expression result');
  return stack[0];
};

const runCalculator = () => {
  try {
    const tokens = tokenize(expressionInput.value);
    const rpn = toRpn(tokens);
    const value = evalRpn(rpn);
    calcResult.textContent = String(value);
  } catch (error) {
    calcResult.textContent = error.message;
  }
};

calcRun?.addEventListener('click', runCalculator);
calcClear?.addEventListener('click', () => {
  expressionInput.value = '';
  calcResult.textContent = '0';
});

const rowsSelect = document.getElementById('rows');
const colsSelect = document.getElementById('cols');
const matrixAContainer = document.getElementById('matrixA');
const matrixBContainer = document.getElementById('matrixB');
const buildMatrixBtn = document.getElementById('buildMatrix');
const runMatrixBtn = document.getElementById('runMatrix');
const matrixResult = document.getElementById('matrixResult');
const operationSelect = document.getElementById('operation');

for (let i = 1; i <= 4; i += 1) {
  rowsSelect?.insertAdjacentHTML('beforeend', `<option value="${i}">${i} rows</option>`);
  colsSelect?.insertAdjacentHTML('beforeend', `<option value="${i}">${i} cols</option>`);
}

const buildGrid = (container, r, c, prefix) => {
  container.innerHTML = '';
  for (let i = 0; i < r; i += 1) {
    const rowDiv = document.createElement('div');
    rowDiv.className = 'd-flex gap-2 mb-2';
    for (let j = 0; j < c; j += 1) {
      const input = document.createElement('input');
      input.type = 'number';
      input.value = '0';
      input.step = 'any';
      input.className = 'form-control form-control-sm';
      input.dataset.key = `${prefix}-${i}-${j}`;
      rowDiv.appendChild(input);
    }
    container.appendChild(rowDiv);
  }
};

buildMatrixBtn?.addEventListener('click', () => {
  const r = Number(rowsSelect.value || 2);
  const c = Number(colsSelect.value || 2);
  buildGrid(matrixAContainer, r, c, 'a');
  buildGrid(matrixBContainer, r, c, 'b');
});

const readGrid = (container) => {
  const rows = [...container.children].map((rowDiv) => [...rowDiv.querySelectorAll('input')].map((input) => Number(input.value)));
  return rows;
};

runMatrixBtn?.addEventListener('click', async () => {
  try {
    const payload = {
      operation: operationSelect.value,
      matrixA: readGrid(matrixAContainer),
      matrixB: readGrid(matrixBContainer)
    };
    const { data } = await window.EngineerHub.requestJSON('/api/tools/matrix', {
      method: 'POST',
      body: JSON.stringify(payload)
    });
    matrixResult.textContent = JSON.stringify(data.result, null, 2);
  } catch (error) {
    matrixResult.textContent = error.message;
  }
});