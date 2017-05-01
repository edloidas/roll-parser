const grammar = require( './grammar' );

// isUnary :: Array -> Boolean
const isUnary = array => array.length === 1;
// concatProps :: { k: [ v ] } -> [ k ] -> [ v, ... ]
const concatProps = obj => keys => keys.reduce(( prev, curr ) => prev.concat( obj[ curr ]), []);

// makeParser :: [ RegExp ] -> ( String -> [ String | Undefined ] )
const makeParser = ( grammarSet ) => {
  if ( isUnary( grammarSet )) {
    return roll => grammarSet[ 0 ].exec( roll );
  }
  return ( roll ) => {
    let result = null;
    grammarSet.some( regex => ( result = regex.exec( roll )));
    return result;
  };
};

const allGrammars = concatProps( grammar )( Object.keys( grammar ));

// parseSimple :: String -> [ String | Undefined ]
const parseSimple = makeParser( grammar.simple );
// parseClassic :: String -> [ String | Undefined ]
const parseClassic = makeParser( grammar.classic );
// parseWod :: String -> [ String | Undefined ]
const parseWod = makeParser( grammar.wod );
// parseAny :: String -> [ String | Undefined ]
const parseAny = makeParser( allGrammars );

module.exports = {
  makeParser,
  parseSimple,
  parseClassic,
  parseWod,
  parseAny,
};
