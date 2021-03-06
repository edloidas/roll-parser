const { parseClassic } = require( '../parser' );
const { mapToRoll } = require( '../mapper' );

/**
 * Parses classic DnD roll notation.
 *
 * @func
 * @since v2.0.0
 * @param {String} roll
 * @return {Roll}
 * @see parse
 * @see parseSimpleRoll
 * @see parseWodRoll
 * @example
 * parseClassicRoll('d10');    //=> { dice: 10, count: 1, modifier: 0 }
 * parseClassicRoll('2d10');   //=> { dice: 10, count: 2, modifier: 0 }
 * parseClassicRoll('d10+1');  //=> { dice: 10, count: 1, modifier: 1 }
 * parseClassicRoll('2d10-1'); //=> { dice: 10, count: 2, modifier: -1 }
 */
const parseClassicRoll = roll => mapToRoll( parseClassic( roll ));

module.exports = parseClassicRoll;
