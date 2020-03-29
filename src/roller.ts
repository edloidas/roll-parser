const { randomRoll } = require( './random' );
const { normalizeRollResult, isDefined } = require( './normalizer' );
const { convertToRoll, convertToWodRoll, convertToAnyRoll } = require( './converter' );
const Result = require( './object/Result' );
const Roll = require( './object/Roll' );
const WodRoll = require( './object/WodRoll' );


/**
 * Rolls the dice from `Roll` object.
 *
 * @func
 * @since v2.0.0
 * @param {Roll} roll - `Roll` object or similar
 * @return {Result}
 * @see roll
 * @see rollWod
 * @example
 * rollClassic(new Roll(10, 2, -1)); //=> { notation: '2d10-1', value: 14, rolls: [ 7, 8 ] }
 * rollClassic({ dice: 6 }); //=> { notation: 'd6', value: 4, rolls: [ 4 ] }
 */
function rollClassic( roll ) {
  const data = roll instanceof Roll ? roll : convertToRoll( roll );
  const { dice, count, modifier } = data;

  const rolls = [ ...new Array( count ) ].map(() => randomRoll( dice ));
  const summ = rolls.reduce(( prev, curr ) => prev + curr, 0 );
  const result = normalizeRollResult( summ + modifier );

  return new Result( data.toString(), result, rolls );
}

/**
 * Rolls the dice from `WodRoll` object.
 *
 * @func
 * @since v2.0.0
 * @param {WodRoll} roll - `WodRoll` object or similar
 * @return {Result}
 * @see roll
 * @see rollClassic
 * @example
 * rollWod(new WodRoll(10, 4, true, 8)); //=> { notation: '4d10!>8', value: 2, rolls: [3,10,7,9,5] }
 * rollWod({ dice: 8, count: 3 }); //=> { notation: '3d8>6', value: 2, rolls: [ 7, 3, 9 ] }
 */
function rollWod( roll ) {
  const data = roll instanceof WodRoll ? roll : convertToWodRoll( roll );
  const { dice, count, again, success, fail } = data;

  const rolls = [];

  let i = count;
  while ( i > 0 ) {
    const value = randomRoll( dice );
    rolls.push( value );
    // Check for "10 Again" flag
    // `repeatLimit` will prevent infinite loop, for cases like `d1!>1`
    const repeatLimit = 100;
    if ( value !== dice || !again || rolls.length > repeatLimit ) {
      i -= 1;
    }
  }

  const result = rolls.reduce(( suc, val ) => {
    if ( val >= success ) {
      return suc + 1;
    } else if ( val <= fail ) {
      return suc - 1;
    }
    return suc;
  }, 0 );

  return new Result( data.toString(), Math.max( result, 0 ), rolls );
}

/**
 * Rolls the dice from `Roll` or `WodRoll` objects.
 *
 * @func
 * @alias roll
 * @since v2.0.0
 * @param {Roll|WodRoll|Object} roll - `Roll`, `WodRoll` or similar object.
 * @return {Result} Returns `Result` for defined parameters, otherwise returns `null`.
 * @see rollClassic
 * @see rollWod
 * @example
 * roll(new Roll(10, 2, -1)); //=> { notation: '2d10-1', value: 14, rolls: [ 7, 8 ] }
 * roll({ dice: 6 }); //=> { notation: 'd6', value: 4, rolls: [ 4 ] }
 * roll(new WodRoll(10, 4, true, 8)); //=> { notation: '4d10!>8', value: 2, rolls: [3,10,7,9,5] }
 * roll({ dice: 8, count: 3, again: true }); //=> { notation: '3d8!>6', value: 2, rolls: [7,3,9 ] }
 * roll( null ); //=> null
 */
function rollAny( roll ) {
  if ( roll instanceof Roll ) {
    return rollClassic( roll );
  } else if ( roll instanceof WodRoll ) {
    return rollWod( roll );
  }
  return isDefined( roll ) ? rollAny( convertToAnyRoll( roll )) : null;
}

module.exports = {
  rollClassic,
  rollWod,
  rollAny,
};
