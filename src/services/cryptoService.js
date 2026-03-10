const ApiError = require('../utils/ApiError');

const parseBig = (value, label) => {
  if (typeof value !== 'string' || !/^-?\d+$/.test(value.trim())) {
    throw new ApiError(422, `${label} must be an integer string`);
  }
  return BigInt(value.trim());
};

const modPow = (base, exp, mod) => {
  if (mod <= 0n) throw new ApiError(422, 'Modulus must be positive');
  let result = 1n;
  let b = ((base % mod) + mod) % mod;
  let e = exp;
  while (e > 0n) {
    if (e & 1n) result = (result * b) % mod;
    e >>= 1n;
    b = (b * b) % mod;
  }
  return result;
};

const gcd = (a, b) => {
  let x = a < 0n ? -a : a;
  let y = b < 0n ? -b : b;
  while (y !== 0n) {
    [x, y] = [y, x % y];
  }
  return x;
};

const egcd = (a, b) => {
  if (b === 0n) return { g: a, x: 1n, y: 0n };
  const { g, x, y } = egcd(b, a % b);
  return { g, x: y, y: x - (a / b) * y };
};

const modInverse = (a, n) => {
  const { g, x } = egcd(a, n);
  if (g !== 1n && g !== -1n) throw new ApiError(422, 'Modular inverse does not exist');
  return ((x % n) + n) % n;
};

const isProbablePrime = (n) => {
  if (n < 2n) return false;
  if (n === 2n || n === 3n) return true;
  if (n % 2n === 0n) return false;

  let d = n - 1n;
  let s = 0n;
  while (d % 2n === 0n) {
    d /= 2n;
    s += 1n;
  }

  const bases = [2n, 3n, 5n, 7n, 11n, 13n, 17n, 19n, 23n, 29n, 31n, 37n];
  for (const a of bases) {
    if (a >= n - 1n) continue;
    let x = modPow(a, d, n);
    if (x === 1n || x === n - 1n) continue;
    let witnessFound = true;
    for (let i = 1n; i < s; i += 1n) {
      x = (x * x) % n;
      if (x === n - 1n) {
        witnessFound = false;
        break;
      }
    }
    if (witnessFound) return false;
  }

  return true;
};

const executeCryptoOperation = (operation, input) => {
  switch (operation) {
    case 'modExp': {
      const a = parseBig(input.a, 'a');
      const b = parseBig(input.b, 'b');
      const n = parseBig(input.n, 'n');
      if (b < 0n) throw new ApiError(422, 'Exponent must be non-negative');
      return modPow(a, b, n).toString();
    }
    case 'modInverse': {
      const a = parseBig(input.a, 'a');
      const n = parseBig(input.n, 'n');
      return modInverse(a, n).toString();
    }
    case 'gcd': {
      const a = parseBig(input.a, 'a');
      const b = parseBig(input.b, 'b');
      return gcd(a, b).toString();
    }
    case 'primeCheck': {
      const n = parseBig(input.n, 'n');
      return {
        number: n.toString(),
        isPrime: isProbablePrime(n),
        method: 'Miller-Rabin'
      };
    }
    default:
      throw new ApiError(400, 'Invalid crypto operation');
  }
};

module.exports = { executeCryptoOperation };