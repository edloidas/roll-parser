const { parseAny } = require( '../parser' );
const { mapToRoll, mapToWodRoll } = require( '../mapper' );
const Type = require( '../object/Type' );

/**
 * Parses simplified, classic or WoD roll notation.
 *
 * @func
 * @since v2.0.0
 * @param {String} roll
 * @return {Roll|WodRoll|null}
 * @see parseSimpleRoll
 * @see parseClassicRoll
 * @see parseWodRoll
 * @example
 * parse('2 10 -1');   //=> { dice: 10, count: 2, modifier: -1 }
 * parse('2d10+1');    //=> { dice: 10, count: 2, modifier: 1 }
 * parse('4d10!>8f1'); //=> { dice: 10, count: 4, again: true, success: 8, fail: 1 }
 * parse('xyz');       //=> null
 */
function parse( roll ) {
  const result = parseAny( roll );
  if ( !result ) {
    return null;
  }

  switch ( result.type ) {
    case Type.simple:
      return mapToRoll( result );
    case Type.classic:
      return mapToRoll( result );
    case Type.wod:
      return mapToWodRoll( result );
    default:
      return null;
  }
}

module.exports = parse;
