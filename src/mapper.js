const Roll = require( './roll' );

// toInteger :: String -> Number
const toInteger = srt => parseInt( srt, 10 ) || null;

// isAbsent :: Any -> Boolean
const isAbsent = value => value === undefined || value === null;

/**
 * @param {Array} result - result of the regex (parse method) excecution.
 */
function map( result ) {
  if ( !result || result.length < 2 ) {
    return null;
  }

  const values = result.slice( 1, 6 ).map( toInteger );

  // Minimum grammar accepts 2 values. If second is not set, it is mapped to `undefined`
  const isSinlge = values.length === 1 || ( values.length === 2 && isAbsent( values[ 1 ]));

  if ( isSinlge ) {
    return new Roll( values[ 0 ]);
  }

  return new Roll( values[ 1 ], values[ 0 ], ...values.slice( 2, 5 ));
}

module.exports = map;
