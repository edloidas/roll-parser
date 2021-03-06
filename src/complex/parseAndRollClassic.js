const { rollClassic } = require( '../roller' );
const parseClassicRoll = require( './parseClassicRoll' );

/**
 * Parses classic notation and then rolls the dice.
 *
 * @func
 * @since v2.0.0
 * @param {String} roll
 * @return {Result}
 * @see parseAndRoll
 * @see parseAndRollSimple
 * @see parseAndRollWod
 * @example
 * parseAndRollClassic('2d10+1');  //=> { notation: '2d10+1', value: 9, rolls: [ 2, 6 ] }
 * parseAndRollClassic('d6');      //=> { notation: 'd6', value: 3, rolls: [ 3 ] }
 */
const parseAndRollClassic = roll => rollClassic( parseClassicRoll( roll ));

module.exports = parseAndRollClassic;
