/**
 * Small deterministic helpers shared across the safety-data code.
 * "Deterministic" = same input string always produces the same output
 * numbers, so demos and frontend development are predictable instead
 * of showing different numbers on every request.
 */

// Simple string hash -> positive integer, used as a seed
function hashString(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0; // convert to 32-bit int
  }
  return Math.abs(hash);
}

// Deterministic pseudo-random number in [min, max], seeded by `seed`
function seededRandom(seed, min, max) {
  const x = Math.sin(seed) * 10000;
  const rand = x - Math.floor(x);
  return Math.floor(rand * (max - min + 1)) + min;
}

module.exports = { hashString, seededRandom };
