// fixInvalid :: Number -> Number -> Number
const fixInvalid = backup => ( value ) => {
  const isValid = value !== undefined &&
                  value !== null &&
                  !Number.isNaN( value ) &&
                  Number.isInteger( value );
  return isValid ? value : backup;
};

// normalizeTop :: Number -> Number
const normalizeTop = top => Math.max( fixInvalid( Number.MAX_SAFE_INTEGER )( top ), 1 );
// normalizeTop :: Number -> Number -> Array
const normalizeBottom = top => bottom => [ Math.min( fixInvalid( 0 )( bottom ), top ), top ];

const normalizeBorders = ( bottom, top ) => normalizeBottom( normalizeTop( top ))( bottom );

module.exports = {
  fixInvalid,
  normalizeTop,
  normalizeBottom,
  normalizeBorders,
};
