const { isAbsent } = require( './normalizer' );
const Roll = require( './object/Roll' );
const WodRoll = require( './object/WodRoll' );

function convertToRoll( object = {}) {
  const { dice, count, modifier } = object || {};

  return new Roll( dice, count, modifier );
}

function convertToWodRoll( object = {}) {
  const { dice, count, again, success, fail } = object || {};

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
 * convert({ dice: 6 }); //=> new Roll( 6 )
 * convert({ modifier: 6 }); //=> new Roll( undefined, undefined, 6 )
 * convert({ dice: 10, count: 5, success: 5 }); //=> new WodRoll( 10, 5, undefined, 5 )
 */
function convertToAnyRoll( object = {}) {
  const { again, success, fail } = object || {};

  if ( isAbsent( again ) && isAbsent( success ) && isAbsent( fail )) {
    return convertToRoll( object );
  } // else
  return convertToWodRoll( object );
}

module.exports = {
  convertToRoll,
  convertToWodRoll,
  convertToAnyRoll,
};
