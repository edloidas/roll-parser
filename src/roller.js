const { randomRoll } = require( './random' );
const { normalizeRollResult } = require( './normalizer' );
const Result = require( './object/Result' );

function rollClassic( roll ) {
  const { dice, count, modifier } = roll;

  const rolls = new Array( count ).fill( randomRoll( dice ));
  const summ = rolls.reduce(( prev, curr ) => prev + curr, 0 );
  const result = normalizeRollResult( summ + modifier );

  return new Result( roll.toString(), result, rolls );
}

function rollWod( roll ) {
  const { dice, count, again, success, fail } = roll;

  const rolls = [];

  let i = count;
  while ( i > 0 ) {
    const value = randomRoll( dice );
    rolls.push( value );
    if ( value !== dice || !again ) {
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

  return new Result( roll.toString(), result, rolls );
}

module.exports = {
  rollClassic,
  rollWod,
};
