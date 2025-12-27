// Use CommonJS to control execution order (imports are hoisted in ES6)
const { Buffer } = require('buffer');
const process = require('process');
const expoCrypto = require('expo-crypto');

// Polyfill crypto.getRandomValues using expo-crypto
if (typeof global.crypto === 'undefined') {
  global.crypto = {};
}
if (typeof global.crypto.getRandomValues === 'undefined') {
  global.crypto.getRandomValues = (array) => {
    const randomBytes = expoCrypto.getRandomBytes(array.length);
    for (let i = 0; i < array.length; i++) {
      array[i] = randomBytes[i];
    }
    return array;
  };
}

// Set up globals FIRST, before any crypto code runs
if (typeof global.Buffer === 'undefined') {
  global.Buffer = Buffer;
}
if (typeof global.process === 'undefined') {
  global.process = process;
}
global.process.browser = true;

console.log('[CRYPTO-SHIM] Globals set up, about to load crypto-browserify');
console.log('[CRYPTO-SHIM] Buffer exists?', typeof global.Buffer !== 'undefined');
console.log('[CRYPTO-SHIM] process exists?', typeof global.process !== 'undefined');

// NOW load crypto-browserify with globals in place
const crypto = require('crypto-browserify');

console.log('[CRYPTO-SHIM] crypto-browserify loaded successfully!');

// Add randomInt implementation that crypto-browserify doesn't have
crypto.randomInt = function randomInt(max, callback) {
  if (typeof callback === 'function') {
    try {
      const result = randomIntSync(max);
      callback(null, result);
    } catch (err) {
      callback(err);
    }
    return;
  }
  return randomIntSync(max);
};

function randomIntSync(max) {
  if (max <= 0 || !Number.isInteger(max)) {
    throw new RangeError('The "max" argument must be a positive integer');
  }

  const range = max;
  const bytesNeeded = Math.ceil(Math.log2(range) / 8);
  const maxValue = Math.pow(256, bytesNeeded);
  const threshold = maxValue - (maxValue % range);

  let randomValue;
  do {
    const randomBytes = crypto.randomBytes(bytesNeeded);
    randomValue = 0;
    for (let i = 0; i < bytesNeeded; i++) {
      randomValue = randomValue * 256 + randomBytes[i];
    }
  } while (randomValue >= threshold);

  return randomValue % range;
}

module.exports = crypto;
