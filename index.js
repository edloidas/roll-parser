const Roll = require( './src/roll' );
const { parseAny, parseSimple, parseClassic } = require( './src/parser' );
const map = require( './src/mapper' );

// parse :: String -> Roll
const parse = roll => map( parseAny( roll ));
// parse :: String -> Roll
const parseSimpleRoll = roll => map( parseSimple( roll ));
// parse :: String -> Roll
const parseClassicRoll = roll => map( parseClassic( roll ));

module.exports = {
  Roll,
  parse,
  parseSimpleRoll,
  parseClassicRoll,
};
