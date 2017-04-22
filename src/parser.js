const grammar = require( './grammar' );

const makeParser = grammarSet => ( roll ) => {
  let result = null;

  grammarSet.some( regex => ( result = regex.exec( roll )));

  return result;
};

const parseSimple = makeParser( grammar.simple );
const parseClassic = makeParser( grammar.classic );
const parseAny = regex => parseSimple( regex ) || parseClassic( regex );

module.exports = {
  parseSimple,
  parseClassic,
  parseAny,
};
