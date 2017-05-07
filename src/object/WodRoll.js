const { fixInvalid, normalizeWodBorders } = require( '../normalizer' );

const positiveInteger = fixInvalid( 1 );

function WodRoll( dice = 20, count = 1, again = false, success = 6, fail = 1 ) {
  this.dice = positiveInteger( dice );
  this.count = positiveInteger( count );
  this.again = !!again;
  [ this.fail, this.success ] = normalizeWodBorders( fail, success, this.dice );
}

module.exports = WodRoll;
