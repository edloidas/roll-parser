const { rollClassic } = require( '../roller' );
const parseSimpleRoll = require( './parseSimpleRoll' );

/**
 * Parses simple notation and then rolls the dice.
 *
 * @func
 * @since v2.0.0
 * @param {String} roll
 * @return {Result}
 * @see parseAndRoll
 * @see parseAndRollSimple
 * @see parseAndRollWod
 * @example
 * parseAndRollSimple('2 10 -1'); //=> { notation: '2d10-1', value: 14, rolls: [ 7, 8 ] }
 */
const parseAndRollSimple = roll => rollClassic( parseSimpleRoll( roll ));

module.exports = parseAndRollSimple;
