const { rollClassic } = require( '../roller' );
const parseClassicRoll = require( './parseClassicRoll' );

/**
 * Parses simplified and classic notation and then rolls the dice.
 *
 * @func
 * @since v2.0.0
 * @param {String} roll
 * @return {Result}
 * @see parseAndRoll
 * @see parseAndRollWod
 * @example
 * parseClassicRoll('2 10 -1'); //=> { notation: '2d10-1', value: 14, rolls: [ 7, 8 ] }
 * parseClassicRoll('2d10+1');  //=> { notation: '2d10+1', value: 9, rolls: [ 2, 6 ] }
 * parseClassicRoll('d6');      //=> { notation: 'd6', value: 3, rolls: [ 3 ] }
 */
const parseAndRollClassic = roll => rollClassic( parseClassicRoll( roll ));

module.exports = parseAndRollClassic;
