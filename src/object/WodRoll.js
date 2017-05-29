const { fixInvalid, normalizeWodBorders } = require( '../normalizer' );
const { wodNotation } = require( '../stringifier' );

const positiveInteger = fixInvalid( 1 );

/**
 * A class that represents a dice roll from World of Darkness setting
 * @class
 * @classdesc A class that represents a dice roll from World of Darkness setting
 * @since v2.0.0
 * @param {Number} dice - A number of dice faces
 * @param {Number} count - A number of dices
 * @param {Boolean} again - A flag for "10 Again" rolls policy
 * @param {Number} success - A minimum value, that counts as success
 * @param {Number} fail - A maximum value, that counts as failure
 * @see Roll
 */
function WodRoll( dice = 10, count = 1, again = false, success = 6, fail ) {
  this.dice = positiveInteger( dice );
  this.count = positiveInteger( count );
  this.again = !!again;
  [ this.fail, this.success ] = normalizeWodBorders( fail, success, this.dice );
}

WodRoll.prototype.toString = function toString() {
  return wodNotation( this );
};

module.exports = WodRoll;
