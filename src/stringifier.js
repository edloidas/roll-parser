function simpleNotation( roll ) {
  const count = roll.count > 1 ? `${ roll.count } ` : '';
  const modifier = roll.modifier ? ` ${ roll.modifier }` : '';

  const hasTopRange = roll.top < roll.dice;
  const hasBottomRange = roll.bottom > 1 || hasTopRange;

  const top = hasTopRange ? ` ${ roll.top }` : '';
  const bottom = hasBottomRange ? ` ${ roll.bottom }` : '';

  return `${ count }${ roll.dice }${ modifier }${ bottom }${ top }`;
}

function classicNotation( roll ) {
  const count = roll.count > 1 ? roll.count : '';
  const modifier = roll.modifier > 0 ? `+${ roll.modifier }` : ( roll.modifier || '' );

  const hasBottomRange = roll.bottom > 1;
  const hasTopRange = roll.top < roll.dice;
  const hasRange = hasBottomRange || hasTopRange;

  let range = '';
  if ( hasRange ) {
    const bottom = hasBottomRange ? roll.bottom : '';
    const top = hasTopRange ? `,${ roll.top }` : '';
    range = ` (${ bottom }${ top })`;
  }

  return `${ count }d${ roll.dice }${ modifier }${ range }`;
}

module.exports = {
  simpleNotation,
  classicNotation,
};
