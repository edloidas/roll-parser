const { normalizeRegexResult, isAbsent } = require( './normalizer' );
const Roll = require( './object/Roll' );
const WodRoll = require( './object/WodRoll' );

// map :: Object -> [Array | null]
//   Takes a result of RegExp.prototype.exec() and returns an Array of integers, strings, and null
function map( result ) {
  const invalid = !result || result.length < 2;
  return invalid ? null : ( result.slice( 1, 6 ).map( normalizeRegexResult ));
}

function orderArguments( values ) {
  if ( !values ) {
    return null;
  }

  // Minimum grammar accepts 2 values. If second is not set, it is mapped to `null`
  const sinlge = values.length === 1 || ( values.length === 2 && isAbsent( values[ 1 ]));
  if ( sinlge ) {
    return [ values[ 0 ] ];
  }

  return [ values[ 1 ], values[ 0 ], ...values.slice( 2, 5 ) ];
}

// mapToRoll :: Object -> [Object | null]
//   Orders map() values with orderArguments(), takes the result
//   and returns a Roll object or null
const mapToRoll = ( result ) => {
  const values = orderArguments( map( result ));
  return values ? new Roll( ...values ) : null;
};

// mapToWodRoll :: Object -> [Object | null]
//   Orders map() values with orderArguments(), takes the result
//   and returns a WodRoll object or null
const mapToWodRoll = ( result ) => {
  const values = orderArguments( map( result ));
  return values ? new WodRoll( values ) : null;
};

module.exports = {
  map,
  orderArguments,
  mapToRoll,
  mapToWodRoll,
};
