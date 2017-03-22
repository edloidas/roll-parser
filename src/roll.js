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
  return '';
};

Roll.prototype.toClassicNotation = function toClassicNotation() {
  const count = this.count > 1 ? this.count : '';
  const modifier = this.modifier > 0 ? `+${ this.modifier }` : ( this.modifier || '' );

  const max = ( this.count * this.dice ) + this.modifier;

  const top = this.top < max ? `,${ this.top }` : '';
  const range = this.bottom > 1 ? ` (${ this.bottom }${ top })` : '';

  return `${ count }d${ this.dice }${ modifier }${ range }`;
};

module.exports = Roll;
