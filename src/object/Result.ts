import {resultNotation} from '../stringifier';
/**
 * A class that represents a dice roll result
 * @class
 * @classdesc A class that represents a dice roll result
 * @since v2.0.0
 * @param {String} notation - A roll notation
 * @param {Number} value - A numeric representation of roll result, like total summ or success count
 * @param {Array} rolls - An array of rolls dome
 * @see Roll
 * @see WodRoll
 */
export default function Result( notation: string, value: number, rolls: number[]) {
  this.notation = notation;
  this.value = value;
  this.rolls = rolls;
}

Result.prototype.toString = function toString() {
  return resultNotation( this );
};
