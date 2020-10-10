import { fixInvalid, normalizeInteger } from '../normalizer';
import { classicNotation } from '../stringifier';

const positiveInteger = fixInvalid( 1 );

/**
 * A class that represents a dice roll from D&D setting
 * @class
 * @classdesc A class that represents a dice roll from D&D setting
 * @since v2.0.0
 * @param {Number} dice - A number of dice faces
 * @param {Number} count - A number of dices
 * @param {Number} modifier - A modifier, that should be added/sustracted from result
 * @see WodRoll
 */
export default function Roll( dice = 20, count = 1, modifier = 0 ) {
  this.dice = positiveInteger( dice );
  this.count = positiveInteger( count );
  this.modifier = normalizeInteger( modifier );
}

Roll.prototype.toString = function toString() {
  return classicNotation( this );
};
