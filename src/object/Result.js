const { resultNotation } = require( '../stringifier' );
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
function Result( notation, value, rolls ) {
  this.notation = notation;
  this.value = value;
  this.rolls = rolls;
}

Result.prototype.toString = function toString() {
  return resultNotation( this );
};

module.exports = Result;
