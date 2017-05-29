const { randomRoll } = require( './random' );
const { normalizeRollResult } = require( './normalizer' );
const Result = require( './object/Result' );
const Roll = require( './object/Roll' );
const WodRoll = require( './object/WodRoll' );


/**
 * Rolls the dice from `Roll` object.
 *
 * @func
 * @since v2.0.0
 * @param {Roll} roll
 * @return {Result}
 * @see roll
 * @see rollWod
 * @example
 * roll(new Roll(10, 2, -1)); //=> { notation: '2d10-1', value: 14, rolls: [ 7, 8 ] }
 */
function rollClassic( roll ) {
  const { dice, count, modifier } = roll;

  const rolls = new Array( count ).fill( randomRoll( dice ));
  const summ = rolls.reduce(( prev, curr ) => prev + curr, 0 );
  const result = normalizeRollResult( summ + modifier );

  return new Result( roll.toString(), result, rolls );
}

/**
 * Rolls the dice from `WodRoll` object.
 *
 * @func
 * @since v2.0.0
 * @param {WodRoll} roll
 * @return {Result}
 * @see roll
 * @see rollClassic
 * @example
 * rollWod(new WodRoll(10, 4, true, 8)); //=> { notation: '4d10!>8', value: 2, rolls: [3,10,7,9,5] }
 */
function rollWod( roll ) {
  const { dice, count, again, success, fail } = roll;

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
    return val;
  }, 0 );

  return new Result( roll.toString(), Math.max( result, 0 ), rolls );
}

/**
 * Rolls the dice from `Roll` or `WodRoll` objects.
 *
 * @func
 * @alias roll
 * @since v2.0.0
 * @param {Roll|WodRoll} roll - structly roll of those two types. Can't parse custom objects.
 * @return {Result|null} `Result` object or `null` if passed arguments is of unknown type
 * @see rollClassic
 * @see rollWod
 * @example
 * roll(new Roll(10, 2, -1)); //=> { notation: '2d10-1', value: 14, rolls: [ 7, 8 ] }
 * roll(new WodRoll(10, 4, true, 8)); //=> { notation: '4d10!>8', value: 2, rolls: [3,10,7,9,5] }
 */
function rollAny( roll ) {
  if ( roll instanceof Roll ) {
    return rollClassic( roll );
  } else if ( roll instanceof WodRoll ) {
    return rollWod( roll );
  }
  return null;
}

module.exports = {
  rollClassic,
  rollWod,
  rollAny,
};
