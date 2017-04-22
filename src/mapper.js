const Roll = require( './roll' );

// toInteger :: String -> Number
const toInteger = srt => parseInt( srt || 0, 10 );

/**
 * @param {Array} result - result of the parse excecution.
 */
function map( result ) {
  if ( !result || result.length < 2 ) {
    return null;
  }

  const values = result.slice( 1, 6 ).map( toInteger );

  if ( values.length === 1 ) {
    return new Roll( values[ 0 ]);
  }

  return new Roll( values[ 1 ], values[ 0 ], ...values.slice( 2, 5 ));
}

module.exports = map;
