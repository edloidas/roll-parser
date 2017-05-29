function simpleNotation( roll ) {
  const count = roll.count > 1 ? `${ roll.count } ` : '';
  const modifier = roll.modifier ? ` ${ roll.modifier }` : '';

  return `${ count }${ roll.dice }${ modifier }`;
}

function classicNotation( roll ) {
  const count = roll.count > 1 ? roll.count : '';
  const modifier = roll.modifier > 0 ? `+${ roll.modifier }` : ( roll.modifier || '' );

  return `${ count }d${ roll.dice }${ modifier }`;
}

function wodNotation( roll ) {
  const count = roll.count > 1 ? roll.count : '';
  const again = roll.again ? '!' : '';
  const fail = roll.fail > 0 ? `f${ roll.fail }` : '';

  return `${ count }d${ roll.dice }${ again }>${ roll.success }${ fail }`;
}

function resultNotation( result ) {
  const { notation, value, rolls } = result;
  return `(${ notation }) ${ value } [${ rolls }]`;
}

module.exports = {
  simpleNotation,
  classicNotation,
  wodNotation,
  resultNotation,
};
