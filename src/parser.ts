import grammar from './grammar';
import Type from './object/Type';

// makeParser :: ( [ RegExp ], String ) -> ( String -> [ String | Undefined ] )
export const makeParser = ( grammarSet: RegExp[], type: string ) => {
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
export const parseSimple = makeParser( grammar.simple, Type.simple );
// parseClassic :: String -> [ String | Undefined ]
export const parseClassic = makeParser( grammar.classic, Type.classic );
// parseWod :: String -> [ String | Undefined ]
export const parseWod = makeParser( grammar.wod, Type.wod );
// parseAny :: String -> [ String | Undefined ]
export const parseAny = roll => parseClassic( roll ) || parseSimple( roll ) || parseWod( roll );
