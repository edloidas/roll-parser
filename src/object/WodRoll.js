const { fixInvalid, normalizeWodBorders } = require( '../normalizer' );
const { wodNotation } = require( '../stringifier' );

const positiveInteger = fixInvalid( 1 );

function WodRoll( dice = 10, count = 1, again = false, success = 6, fail = 1 ) {
  this.dice = positiveInteger( dice );
  this.count = positiveInteger( count );
  this.again = !!again;
  [ this.fail, this.success ] = normalizeWodBorders( fail, success, this.dice );
}

WodRoll.prototype.toString = function toString() {
  return wodNotation( this );
};

module.exports = WodRoll;
