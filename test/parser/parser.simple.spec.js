const { parseSimple } = require( '../../src/parser' );
const Type = require( '../../src/object/Type' );
const { testParse } = require( '../util' );

testParse(
  parseSimple,
  'Parse `simple` notation:',
  [ '0', '1 2', '1 2 3', '1 2 -3' ],
  [ '1 2 3 4', '1 2 3 4 5' ],
  Type.simple,
);
