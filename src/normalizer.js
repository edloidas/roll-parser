// isPositiveInteger :: Number -> Boolean
const isPositiveInteger = value => Number.isInteger( value ) && value > 0;

// fixInvalid :: Number -> Any -> Number
const fixInvalid = backup => value => ( isPositiveInteger( value ) ? value : backup );

// normalizeInteger :: Any -> Number
const normalizeInteger = value => ( Number.isInteger( value ) ? value : 0 );


// normalizeTop :: Any -> Number
const normalizeTop = top => fixInvalid( Number.MAX_SAFE_INTEGER )( top );
// normalizeTop :: a -> Number -> [ Number, a ]
const normalizeBottom = top => bottom => [ Math.min( fixInvalid( 0 )( bottom ), top ), top ];
// ( a, b ) -> [ Number, Number ]
const normalizeBorders = ( bottom, top ) => normalizeBottom( normalizeTop( top ))( bottom );


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
  normalizeTop,
  normalizeBottom,
  normalizeBorders,
  normalizeInteger,
  normalizeRegexResult,
};
