// Prime tools page: externalized to satisfy CSP.
(() => {
  const actionMap = {
    generatePrimes,
    checkPrime,
    calculateModExp,
    calculateGCD,
    calculateInverse,
    calculateExtendedEuclidean
  };

  document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('[data-action]').forEach((button) => {
      const action = button.getAttribute('data-action');
      const handler = actionMap[action];
      if (handler) {
        button.addEventListener('click', handler);
      }
    });

    setTimeout(() => {
      generatePrimes();
      calculateModExp();
      calculateGCD();
      calculateInverse();
      calculateExtendedEuclidean();
    }, 100);
  });

  document.addEventListener('keypress', (event) => {
    const activeId = document.activeElement ? document.activeElement.id : '';
    if (event.key === 'Enter' && activeId === 'primeNumber') {
      event.preventDefault();
      checkPrime();
    }
  });

  // ========== PRIME GENERATOR ==========
  function generatePrimes() {
    const digitsSelect = document.getElementById('primeDigits');
    const countSelect = document.getElementById('primeCount');

    if (!digitsSelect || !countSelect) {
      alert('Error: Could not find select elements');
      return;
    }

    const digits = parseInt(digitsSelect.value, 10);
    const count = parseInt(countSelect.value, 10);

    const min = Math.pow(10, digits - 1);
    const max = Math.pow(10, digits) - 1;

    const primes = [];
    let num = min;

    if (num % 2 === 0) num += 1;

    while (primes.length < count && num <= max) {
      if (isPrime(num)) {
        primes.push(num);
      }
      num += 2;
    }

    displayPrimes(primes);
  }

  function displayPrimes(primes) {
    const primeList = document.getElementById('primeList');
    const generatedCount = document.getElementById('generatedCount');
    const smallestPrime = document.getElementById('smallestPrime');
    const largestPrime = document.getElementById('largestPrime');

    if (!primeList) return;

    primeList.innerHTML = '';

    if (primes.length === 0) {
      primeList.innerHTML = '<div style="color: #94a3b8; padding: 1rem; text-align: center;">No primes found</div>';
      return;
    }

    primes.forEach((prime) => {
      const primeItem = document.createElement('div');
      primeItem.className = 'prime-item';
      primeItem.textContent = prime;
      primeList.appendChild(primeItem);
    });

    if (generatedCount) generatedCount.textContent = primes.length;
    if (smallestPrime) smallestPrime.textContent = Math.min(...primes);
    if (largestPrime) largestPrime.textContent = Math.max(...primes);
  }

  // ========== PRIME CHECKER ==========
  function checkPrime() {
    const input = document.getElementById('primeNumber');
    const resultDiv = document.getElementById('primeResult');
    const messageSpan = document.getElementById('primeMessage');

    if (!input || !resultDiv || !messageSpan) {
      alert('Error: Could not find elements');
      return;
    }

    const numStr = input.value;
    const num = parseInt(numStr, 10);

    if (Number.isNaN(num)) {
      resultDiv.className = 'prime-result not-prime';
      messageSpan.textContent = 'Please enter a valid number';
      return;
    }

    if (num > Number.MAX_SAFE_INTEGER) {
      resultDiv.className = 'prime-result not-prime';
      messageSpan.textContent = 'Number too large for safe calculation';
      return;
    }

    const prime = isPrime(num);

    if (prime) {
      resultDiv.className = 'prime-result prime';
      messageSpan.textContent = `${num} is a prime number ✓`;
    } else {
      const factors = findFactors(num);
      resultDiv.className = 'prime-result not-prime';
      messageSpan.textContent = `${num} is not a prime number ✗ (Factors: ${factors})`;
    }
  }

  function findFactors(n) {
    const factors = [];
    for (let i = 2; i <= Math.sqrt(n); i += 1) {
      if (n % i === 0) {
        factors.push(i);
        if (i !== n / i) {
          factors.push(n / i);
        }
      }
    }
    if (factors.length === 0) return 'none';
    return factors.sort((a, b) => a - b).join(', ');
  }

  // ========== MILLER-RABIN PRIMALITY TEST ==========
  function isPrime(n) {
    if (n < 2) return false;
    if (n === 2 || n === 3) return true;
    if (n % 2 === 0) return false;

    let d = n - 1;
    let r = 0;

    while (d % 2 === 0) {
      d = Math.floor(d / 2);
      r += 1;
    }

    const bases = [2, 3, 5, 7, 11, 13];

    for (const a of bases) {
      if (a >= n) continue;

      let x = modExp(a, d, n);
      if (x === 1 || x === n - 1) continue;

      let composite = true;
      for (let i = 0; i < r - 1; i += 1) {
        x = modExp(x, 2, n);
        if (x === n - 1) {
          composite = false;
          break;
        }
      }

      if (composite) return false;
    }

    return true;
  }

  // ========== MODULAR EXPONENTIATION ==========
  function modExp(base, exponent, modulus) {
    if (modulus === 1) return 0;
    let result = 1;
    let baseValue = base % modulus;

    let exp = exponent;
    while (exp > 0) {
      if (exp % 2 === 1) {
        result = (result * baseValue) % modulus;
      }
      baseValue = (baseValue * baseValue) % modulus;
      exp = Math.floor(exp / 2);
    }
    return result;
  }

  function calculateModExp() {
    const base = parseInt(document.getElementById('modBase').value, 10) || 0;
    const exponent = parseInt(document.getElementById('modExponent').value, 10) || 0;
    const modulus = parseInt(document.getElementById('modModulus').value, 10) || 1;

    const result = modExp(base, exponent, modulus);

    const resultBox = document.getElementById('modExpResult');
    const resultValue = document.getElementById('modExpValue');

    if (resultBox && resultValue) {
      const label = resultBox.querySelector('.label');
      if (label) label.innerHTML = `Result: ${base}^${exponent} mod ${modulus}`;
      resultValue.textContent = result;
    }
  }

  // ========== GCD CALCULATOR ==========
  function gcd(a, b) {
    let x = Math.abs(a);
    let y = Math.abs(b);

    while (y !== 0) {
      [x, y] = [y, x % y];
    }
    return x;
  }

  function calculateGCD() {
    const a = parseInt(document.getElementById('gcdA').value, 10) || 0;
    const b = parseInt(document.getElementById('gcdB').value, 10) || 0;

    const result = gcd(a, b);

    const resultBox = document.getElementById('gcdResult');
    const resultValue = document.getElementById('gcdValue');

    if (resultBox && resultValue) {
      const label = resultBox.querySelector('.label');
      if (label) label.innerHTML = `GCD(${a}, ${b}):`;
      resultValue.textContent = result;
    }
  }

  // ========== EXTENDED EUCLIDEAN ALGORITHM ==========
  function extendedEuclidean(a, b) {
    let x = Math.abs(a);
    let y = Math.abs(b);

    let m0 = 1;
    let m1 = 0;
    let n0 = 0;
    let n1 = 1;

    while (x !== 0) {
      const q = Math.floor(y / x);
      [y, x] = [x, y % x];
      [m0, m1] = [m1, m0 - m1 * q];
      [n0, n1] = [n1, n0 - n1 * q];
    }

    return { gcd: y, x: m0, y: n0 };
  }

  function calculateExtendedEuclidean() {
    const a = parseInt(document.getElementById('eucA').value, 10) || 0;
    const b = parseInt(document.getElementById('eucB').value, 10) || 0;

    const result = extendedEuclidean(a, b);

    const eucValue = document.getElementById('eucValue');
    const eucEquation = document.getElementById('eucEquation');

    if (eucValue && eucEquation) {
      eucValue.textContent = `x = ${result.x}, y = ${result.y}`;
      eucEquation.textContent = `${a}(${result.x}) + ${b}(${result.y}) = ${result.gcd}`;
    }
  }

  // ========== MODULAR INVERSE ==========
  function modularInverse(a, m) {
    const result = extendedEuclidean(a, m);

    if (result.gcd !== 1) {
      return null;
    }

    return ((result.x % m) + m) % m;
  }

  function calculateInverse() {
    const a = parseInt(document.getElementById('invNumber').value, 10) || 0;
    const m = parseInt(document.getElementById('invModulus').value, 10) || 1;

    const inverse = modularInverse(a, m);

    const inverseLabel = document.getElementById('inverseLabel');
    const inverseValue = document.getElementById('inverseValue');

    if (!inverseLabel || !inverseValue) return;

    if (inverse === null) {
      inverseLabel.innerHTML = 'Inverse exists? No';
      inverseValue.innerHTML = 'Not invertible';
      inverseValue.style.color = '#ef4444';
    } else {
      inverseLabel.innerHTML = 'Inverse exists? Yes';
      inverseValue.innerHTML = inverse;
      inverseValue.style.color = '#10b981';
    }
  }
})();
