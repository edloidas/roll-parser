const { fixInvalid, normalizeBorders, normalizeInteger } = require( '../normalizer' );
const { classicNotation } = require( '../stringifier' );

const positiveInteger = fixInvalid( 1 );

function Roll( dice = 20, count = 1, modifier = 0, bottom, top ) {
  this.dice = positiveInteger( dice );
  this.count = positiveInteger( count );
  this.modifier = normalizeInteger( modifier );
  [ this.bottom, this.top ] = normalizeBorders( bottom, top );
}

Roll.prototype.toString = function toString() {
  return classicNotation( this );
};

module.exports = Roll;
