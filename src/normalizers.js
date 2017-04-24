const isPositiveInteger = value => Number.isInteger( value ) && value > 0;

// fixInvalid :: Number -> any -> Number
const fixInvalid = backup => value => ( isPositiveInteger( value ) ? value : backup );

// any -> Number
const normalizeInteger = value => ( Number.isInteger( value ) ? value : 0 );

// normalizeTop :: Number -> Number
const normalizeTop = top => fixInvalid( Number.MAX_SAFE_INTEGER )( top ) || Number.MAX_SAFE_INTEGER;
// normalizeTop :: Number -> Number -> Array
const normalizeBottom = top => bottom => [ Math.min( fixInvalid( 0 )( bottom ), top ), top ];

const normalizeBorders = ( bottom, top ) => normalizeBottom( normalizeTop( top ))( bottom );

module.exports = {
  fixInvalid,
  normalizeTop,
  normalizeBottom,
  normalizeBorders,
  normalizeInteger,
};
