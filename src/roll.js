/*
{count}d{dice}{modifier} ({bottom},{top})
*/
function Roll( dice = 20, count = 1, modifier = 0, bottom = 0, top = Number.MAX_SAFE_INTEGER ) {
  this.dice = dice;
  this.count = count;
  this.modifier = modifier;
  this.bottom = bottom;
  this.top = Math.max( top, 1 );
}

Roll.prototype.toSimpleNotation = function toSimpleNotation() {
  return '';
};

Roll.prototype.toClassicNotation = function toClassicNotation() {
  return '';
};

module.exports = Roll;
