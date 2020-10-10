import { parseAny } from '../parser';
import { mapToRoll, mapToWodRoll } from '../mapper';
import Type from '../object/Type';

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
export default function parse( roll ) {
  const result = parseAny( roll );
  const type = result ? result.type : '';

  switch ( type ) {
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
