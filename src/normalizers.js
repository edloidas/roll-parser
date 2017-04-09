const isNonNegativeInteger = value => Number.isInteger( value ) && value >= 0;

// fixInvalid :: Number -> Number -> Number
const fixInvalid = backup => ( value ) => {
  const isValid = value !== undefined &&
                  value !== null &&
                  !Number.isNaN( value ) &&
                  isNonNegativeInteger( value );
  return isValid ? value : backup;
};

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
};
