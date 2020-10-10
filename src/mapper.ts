import { normalizeRegexResult, isAbsent } from './normalizer';
import Roll from './object/Roll';
import WodRoll from './object/WodRoll';

// map :: Object -> [Array | null]
//   Takes a result of RegExp.prototype.exec() and returns an Array of integers, strings, and null
export function map( result ) {
  const invalid = !result || result.length < 2;
  return invalid ? null : ( result.slice( 1 ).map( normalizeRegexResult ));
}

export const orderArguments = limit => ( values ) => {
  if ( !values || values.length === 0 ) {
    return null;
  }

  // Minimum grammar accepts 2 values. If second is not set, it is mapped to `null`
  const sinlge = values.length === 1 || values.slice( 1 ).every( isAbsent );
  if ( sinlge ) {
    return [ values[ 0 ] ];
  }

  return [ values[ 1 ], values[ 0 ], ...values.slice( 2, limit ) ];
};

const orderRollArguments = orderArguments( 3 );
const orderWodRollArguments = orderArguments( 5 );

// mapToRoll :: Object -> [Object | null]
//   Orders map() values with orderArguments(), takes the result
//   and returns a Roll object or null
export const mapToRoll = ( result ) => {
  const values = orderRollArguments( map( result ));
  return values ? new Roll( ...values ) : null;
};

// mapToWodRoll :: Object -> [Object | null]
//   Orders map() values with orderArguments(), takes the result
//   and returns a WodRoll object or null
export const mapToWodRoll = ( result ) => {
  const values = orderWodRollArguments( map( result ));
  return values ? new WodRoll( values[ 0 ], values[ 1 ], values[ 2 ], values[ 3 ], values[ 4 ]) : null;
  // return values ? new WodRoll( ...values ) : null;
};
