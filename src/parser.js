const grammar = require( './grammar' );

// isUnary :: Array -> Boolean
const isUnary = array => array.length === 1;

// makeParser :: Array -> String -> Array
const makeParser = ( grammarSet ) => {
  if ( isUnary( grammarSet )) {
    return roll => grammarSet[ 0 ].exec( roll );
  } // else
  return ( roll ) => {
    let result = null;
    grammarSet.some( regex => ( result = regex.exec( roll )));
    return result;
  };
};

// parseSimple :: String -> Array
const parseSimple = makeParser( grammar.simple );
// parseClassic :: String -> Array
const parseClassic = makeParser( grammar.classic );
// parseAny :: String -> Array
const parseAny = makeParser([].concat( grammar.simple, grammar.classic ));

module.exports = {
  parseSimple,
  parseClassic,
  parseAny,
};
