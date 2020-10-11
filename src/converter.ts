import { isAbsent } from './normalizer';
import Roll from './object/Roll';
import WodRoll from './object/WodRoll';

export function convertToRoll( object = {}) {
  const { dice, count, modifier } = ( object || {}) as any;

  return new Roll( dice, count, modifier );
}

export function convertToWodRoll( object = {}) {
  const { dice, count, again, success, fail } = ( object || {}) as any;

  return new WodRoll( dice, count, again, success, fail );
}

/**
 * Converts any arguments to `Roll` or `WodRoll` object.
 * If passed argument has `again`, `success` or `fail` property, the function will return `WodRoll`.
 * Otherwise, `Roll` will be returned.
 *
 * @func
 * @alias convert
 * @since v2.1.0
 * @param {Object} object - `Roll`, `WodRoll` or similar object.
 * @return {Roll|WodRoll} Result of converion.
 * @example
 * ```typescript
 * convert({ dice: 6 }); //=> new Roll( 6 )
 * convert({ modifier: 6 }); //=> new Roll( undefined, undefined, 6 )
 * convert({ dice: 10, count: 5, success: 5 }); //=> new WodRoll( 10, 5, undefined, 5 )
 * ```
 */
export function convertToAnyRoll( object = {}) {
  const { again, success, fail } = ( object || {}) as any;

  if ( isAbsent( again ) && isAbsent( success ) && isAbsent( fail )) {
    return convertToRoll( object );
  } // else
  return convertToWodRoll( object );
}
