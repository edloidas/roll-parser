const { normalizeRegexResult, isAbsent } = require( './normalizer' );
const Roll = require( './object/Roll' );

// map :: Object -> [Array | null]
//   Takes a result of RegExp.prototype.exec() and returns an Array of integers, strings, and null
function map( result ) {
  const invalid = !result || result.length < 2;
  return invalid ? null : ( result.slice( 1, 6 ).map( normalizeRegexResult ));
}

// map :: Object -> [Object | null]
//   Takes a result of map() function and returns a Roll object or null
function mapToRoll( result ) {
  const numbers = map( result );

  if ( !numbers ) {
    return null;
  }

  // Minimum grammar accepts 2 values. If second is not set, it is mapped to `null`
  const sinlge = numbers.length === 1 || ( numbers.length === 2 && isAbsent( numbers[ 1 ]));
  if ( sinlge ) {
    return new Roll( numbers[ 0 ]);
  }

  return new Roll( numbers[ 1 ], numbers[ 0 ], ...numbers.slice( 2, 5 ));
}

module.exports = {
  map,
  mapToRoll,
};
