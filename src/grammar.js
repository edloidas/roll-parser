// Multiple instances of classic and simple notations exists fro purposes of readability
module.exports = {
  simple: [
    /^(\d+)(?:\s*)(\d+)?$/,                                                     // 20 || 1 20
    /^(\d+)(?:\s+)(\d+)(?:\s+)([+-]?\d+)?(?:\s*)(\d+)?(?:\s*)(\d+)?$/,          // 1 20 4 || 1 20 +4 5 || 1 20 -4 5 20
  ],
  classic: [
    /^(\d*)(?:[dD])(\d+)([+-]\d+)?$/,                                           // d20 || 1d20 || d20+4 || 1d20-4
    /^(\d*)(?:[dD])(\d+)([+-]\d+)?(?:\s+\(\s*)(\d+)(?:\s*,?\s*\))$/,            // 1d20+4 (5) || 1d20-4 (5,)
    /^(\d*)(?:[dD])(\d+)([+-]\d+)?(?:\s+\(\s*)(\d*)(?:\s*,\s*)(\d+)(?:\s*\))$/, // 1d20+4 (5,18) && 1d20-4 (,18)
  ],
};
