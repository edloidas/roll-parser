const Roll = require( './src/roll' );
const { parseAny, parseSimple, parseClassic } = require( './src/parser' );
const { mapToRoll } = require( './src/mapper' );

// parse :: String -> Roll
const parse = roll => mapToRoll( parseAny( roll ));
// parse :: String -> Roll
const parseSimpleRoll = roll => mapToRoll( parseSimple( roll ));
// parse :: String -> Roll
const parseClassicRoll = roll => mapToRoll( parseClassic( roll ));

module.exports = {
  Roll,
  parse,
  parseSimpleRoll,
  parseClassicRoll,
};
