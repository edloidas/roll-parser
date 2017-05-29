const grammar = require( './grammar' );
const Type = require( './object/Type' );

// isUnary :: Array -> Boolean
const isUnary = array => array.length === 1;

// makeParser :: ( [ RegExp ], String ) -> ( String -> [ String | Undefined ] )
const makeParser = ( grammarSet, type ) => {
  if ( isUnary( grammarSet )) {
    return ( roll ) => {
      const result = grammarSet[ 0 ].exec( roll );
      if ( result ) {
        result.type = type;
      }
      return result;
    };
  }
  return ( roll ) => {
    let result = null;
    grammarSet.some( regex => ( result = regex.exec( roll )));
    if ( result ) {
      result.type = type;
    }
    return result;
  };
};

// parseSimple :: String -> [ String | Undefined ]
const parseSimple = makeParser( grammar.simple, Type.simple );
// parseClassic :: String -> [ String | Undefined ]
const parseClassic = makeParser( grammar.classic, Type.classic );
// parseWod :: String -> [ String | Undefined ]
const parseWod = makeParser( grammar.wod, Type.wod );
// parseAny :: String -> [ String | Undefined ]
const parseAny = roll => parseClassic( roll ) || parseSimple( roll ) || parseWod( roll );

module.exports = {
  makeParser,
  parseSimple,
  parseClassic,
  parseWod,
  parseAny,
};
