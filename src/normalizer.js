// isPositiveInteger :: Number -> Boolean
const isPositiveInteger = value => Number.isInteger( value ) && value > 0;

// fixInvalid :: Number -> Any -> Number
const fixInvalid = backup => value => ( isPositiveInteger( value ) ? value : backup );

// normalizeInteger :: Any -> Number
const normalizeInteger = value => ( Number.isInteger( value ) ? value : 0 );

// normalizeRollResult :: Any -> Number
const normalizeRollResult = fixInvalid( 1 );

// normalizeTop :: Number -> Number -> Number
const normalizeTop = max => top => Math.min( fixInvalid( Number.MAX_SAFE_INTEGER )( top ), max );
// normalizeTop :: Number -> Number -> Number
const normalizeBottom = max => bottom => Math.min( fixInvalid( 0 )( bottom ), max );

// normalizeWodBorders :: ( Number, Number, Number ) -> [ Number, Number ]
const normalizeWodBorders = ( bottom, top, max ) => {
  const b = normalizeTop( max )( top );
  const a = normalizeBottom( b - 1 )( bottom );
  return [ a, b ];
};

// isAbsent :: Any -> Boolean
//   Checks for absence of the values from RegExp execution result.
const isAbsent = value => value === undefined || value === null || value === '';

// toInteger :: a -> Number | a
// a = String | Any
const toInteger = value => parseInt( value, 10 ) || value;


// normalizeRegexResult :: Any -> null | Number | String
const normalizeRegexResult = value => ( isAbsent( value ) ? null : toInteger( value ));

module.exports = {
  isAbsent,
  fixInvalid,
  normalizeInteger,
  normalizeRollResult,
  normalizeTop,
  normalizeBottom,
  normalizeWodBorders,
  normalizeRegexResult,
};
