const { fixInvalid, normalizeBorders, normalizeInteger } = require( './normalizer' );

const positiveInteger = fixInvalid( 1 );

function Roll( dice = 20, count = 1, modifier = 0, bottom, top ) {
  this.dice = positiveInteger( dice );
  this.count = positiveInteger( count );
  this.modifier = normalizeInteger( modifier );
  [ this.bottom, this.top ] = normalizeBorders( bottom, top );
}

Roll.prototype.toSimpleNotation = function toSimpleNotation() {
  const count = this.count > 1 ? `${ this.count } ` : '';
  const modifier = this.modifier ? ` ${ this.modifier }` : '';

  const hasTopRange = this.top < this.dice;
  const hasBottomRange = this.bottom > 1 || hasTopRange;

  const top = hasTopRange ? ` ${ this.top }` : '';
  const bottom = hasBottomRange ? ` ${ this.bottom }` : '';

  return `${ count }${ this.dice }${ modifier }${ bottom }${ top }`;
};

Roll.prototype.toClassicNotation = function toClassicNotation() {
  const count = this.count > 1 ? this.count : '';
  const modifier = this.modifier > 0 ? `+${ this.modifier }` : ( this.modifier || '' );

  const hasBottomRange = this.bottom > 1;
  const hasTopRange = this.top < this.dice;
  const hasRange = hasBottomRange || hasTopRange;

  let range = '';
  if ( hasRange ) {
    const bottom = hasBottomRange ? this.bottom : '';
    const top = hasTopRange ? `,${ this.top }` : '';
    range = ` (${ bottom }${ top })`;
  }

  return `${ count }d${ this.dice }${ modifier }${ range }`;
};

module.exports = Roll;
