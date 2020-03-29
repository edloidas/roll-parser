const { parseWod } = require( '../parser' );
const { mapToWodRoll } = require( '../mapper' );

/**
 * Parses World of Darkness (WoD) roll notation.
 *
 * @func
 * @since v2.0.0
 * @param {String} roll
 * @return {WodRoll}
 * @see parse
 * @see parseSimpleRoll
 * @see parseClassicRoll
 * @example
 * parseWodRoll('d10>6');     //=> { dice: 10, count: 1, again: false, success: 6, fail: 0 }
 * parseWodRoll('2d10!>6');   //=> { dice: 10, count: 2, again: true, success: 6, fail: 0 }
 * parseWodRoll('4d10!>8f1'); //=> { dice: 10, count: 4, again: true, success: 8, fail: 1 }
 */
const parseWodRoll = roll => mapToWodRoll( parseWod( roll ));

module.exports = parseWodRoll;
