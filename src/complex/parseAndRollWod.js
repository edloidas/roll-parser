const { rollWod } = require( '../roller' );
const parseWodRoll = require( './parseWodRoll' );

/**
 * Parses WoD roll notation and then rolls the dice.
 *
 * @func
 * @since v2.0.0
 * @param {String} roll
 * @return {Result}
 * @see parseAndRoll
 * @see parseAndRollSimple
 * @see parseAndRollClassic
 * @example
 * parseAndRollWod('2d10>6');    //=> { notation: '2d10>6', value: 1, rolls: [ 5, 10 ] }
 * parseAndRollWod('4d10!>8f1'); //=> { notation: '4d10!>8f1', value: 2, rolls: [ 3, 10, 7, 9, 5 ] }
 */
const parseAndRollWod = roll => rollWod( parseWodRoll( roll ));

module.exports = parseAndRollWod;
