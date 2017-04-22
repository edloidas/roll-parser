const grammar = require( './grammar' );

// makeParser :: Array -> String -> Array
const makeParser = grammarSet => ( roll ) => {
  let result = null;

  grammarSet.some( regex => ( result = regex.exec( roll )));

  return result;
};

// parseSimple :: String -> Array
const parseSimple = makeParser( grammar.simple );
// parseClassic :: String -> Array
const parseClassic = makeParser( grammar.classic );
// parseAny :: String -> Array
const parseAny = roll => parseSimple( roll ) || parseClassic( roll );

module.exports = {
  parseSimple,
  parseClassic,
  parseAny,
};
