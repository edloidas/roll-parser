const { parseSimple } = require( '../parser' );
const { mapToRoll } = require( '../mapper' );

/**
 * Parses simple roll notation (space separated values).
 *
 * @func
 * @since v2.0.0
 * @param {String} roll
 * @return {Roll}
 * @see parse
 * @see parseClassicRoll
 * @see parseWodRoll
 * @example
 * parseSimpleRoll('10');      //=> { dice: 10, count: 1, modifier: 0 }
 * parseSimpleRoll('2 10');    //=> { dice: 10, count: 2, modifier: 0 }
 * parseSimpleRoll('2 10 -1'); //=> { dice: 10, count: 2, modifier: -1 }
 */
const parseSimpleRoll = roll => mapToRoll( parseSimple( roll ));

module.exports = parseSimpleRoll;
