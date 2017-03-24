/*
{count}d{dice}{modifier} ({bottom},{top})
*/
function Roll( dice = 20, count = 1, modifier = 0, bottom = 0, top = Number.MAX_SAFE_INTEGER ) {
  this.dice = dice;
  this.count = count;
  this.modifier = modifier;
  this.top = Math.max( top, 1 );
  this.bottom = Math.min( bottom, this.top );
}

Roll.prototype.toSimpleNotation = function toSimpleNotation() {
  const count = this.count > 1 ? `${ this.count } ` : '';
  const modifier = this.modifier || '';

  const max = ( this.count * this.dice ) + this.modifier;

  const top = this.top < max ? ` ${ this.top }` : '';
  const bottom = this.bottom > 1 ? ` ${ this.bottom }` : '';

  return `${ count }${ this.dice }${ modifier }${ bottom }${ top }`;
};

Roll.prototype.toClassicNotation = function toClassicNotation() {
  const count = this.count > 1 ? this.count : '';
  const modifier = this.modifier > 0 ? `+${ this.modifier }` : ( this.modifier || '' );

  const max = ( this.count * this.dice ) + this.modifier;
  const hasBottomRange = this.bottom > 1;
  const hasTopRange = this.top < max;
  const hasRange = hasBottomRange || hasTopRange;

  let range = '';
  if ( hasRange ) {
    const bottom = hasBottomRange ? this.bottom : '';
    const top = hasTopRange ? `,${ this.top }` : '';
    range = `(${ bottom }${ top })`;
  }

  return `${ count }d${ this.dice }${ modifier }${ range }`;
};

module.exports = Roll;
