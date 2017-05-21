const { fixInvalid, normalizeBorders, normalizeInteger } = require( '../normalizer' );
const { classicNotation } = require( '../stringifier' );

const positiveInteger = fixInvalid( 1 );

/**
 * A class that represents a dice roll from D&D setting
 * @class
 * @classdesc A class that represents a dice roll from D&D setting
 * @since v2.0.0
 * @param {Number} dice - A number of dice faces
 * @param {Number} count - A number of dices
 * @param {Number} modifier - A modifier, that should be added/sustracted from result
 * @param {Number} bottom - A non-standard value, below wich dice roll shouldn't be count
 * @param {Number} top - A non-standard value, above wich dice roll shouldn't be count
 * @see WodRoll
 */
function Roll( dice = 20, count = 1, modifier = 0, bottom, top ) {
  this.dice = positiveInteger( dice );
  this.count = positiveInteger( count );
  this.modifier = normalizeInteger( modifier );
  [ this.bottom, this.top ] = normalizeBorders( bottom, top, this.dice );
}

Roll.prototype.toString = function toString() {
  return classicNotation( this );
};

module.exports = Roll;
