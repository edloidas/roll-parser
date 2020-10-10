// isPositiveInteger :: Number -> Boolean
export const isPositiveInteger = value => Number.isInteger( value ) && value > 0;

// fixInvalid :: Number -> Any -> Number
export const fixInvalid = backup => value => ( isPositiveInteger( value ) ? value : backup );

// normalizeInteger :: Any -> Number
export const normalizeInteger = value => ( Number.isInteger( value ) ? value : 0 );

// normalizeRollResult :: Any -> Number
export const normalizeRollResult = fixInvalid( 1 );

// normalizeTop :: Number -> Number -> Number
export const normalizeTop = max => top => Math.min( fixInvalid( Number.MAX_SAFE_INTEGER )( top ), max );
// normalizeTop :: Number -> Number -> Number
export const normalizeBottom = max => bottom => Math.min( fixInvalid( 0 )( bottom ), max );

// normalizeWodBorders :: ( Number, Number, Number ) -> [ Number, Number ]
export const normalizeWodBorders = ( bottom, top, max ) => {
  const b = normalizeTop( max )( top );
  const a = normalizeBottom( b - 1 )( bottom );
  return [ a, b ];
};

// isDefined :: Any -> Boolean
//   Checks for the existence of the value
export const isDefined = value => value !== undefined && value !== null;

// isAbsent :: Any -> Boolean
//   Checks for absence of the values from RegExp execution result.
export const isAbsent = value => value === undefined || value === null || value === '';

// toInteger :: a -> Number | a
// a = String | Any
export const toInteger = value => parseInt( value, 10 ) || value;


// normalizeRegexResult :: Any -> null | Number | String
export const normalizeRegexResult = value => ( isAbsent( value ) ? null : toInteger( value ));
