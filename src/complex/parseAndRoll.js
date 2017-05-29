const { rollAny } = require( '../roller' );
const parse = require( './parse' );

/**
 * Parses simplified, classic or WoD roll notation and then rolls the dice.
 *
 * @func
 * @since v2.0.0
 * @param {String} roll
 * @return {Result}
 * @see parseAndRollSimple
 * @see parseAndRollClassic
 * @see parseAndRollWod
 * @example
 * parseAndRoll('2 10 -1');   //=> { notation: '2d10-1', value: 14, rolls: [ 7, 8 ] }
 * parseAndRoll('2d10+1');    //=> { notation: '2d10+1', value: 9, rolls: [ 2, 6 ] }
 * parseAndRoll('4d10!>8f1'); //=> { notation: '4d10!>8f1', value: 2, rolls: [ 3, 10, 7, 9, 5 ] }
 */
const parseAndRoll = roll => rollAny( parse( roll ));

module.exports = parseAndRoll;
