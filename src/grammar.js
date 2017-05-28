// Multiple instances of each notation exists for purposes of readability
// Each grammar is an array of RegExps
module.exports = {
  simple: [
    /^(\d+)(?:\s+(\d+)(?:\s+([+-]?\d+))?)?$/,        // 1 20 4 || 1 20 +4 5 || 1 20 -4 5 20
  ],
  classic: [
    /^(\d*)(?:[dD])(\d+)([+-]\d+)?$/,                // d20 || 1d20 || d20+4 || 1d20-4
  ],
  wod: [
    /^(\d*)(?:[dD])(\d+)(!?)$/,                      // d10 || d10! || 1d10 || 1d10!
    /^(\d*)(?:[dD])(\d+)(!?)(?:>)(\d+)(?:f(\d+))?$/, // d10>6 || 1d10>6 || 1d10!>6 || 1d10!>6f1
  ],
};
