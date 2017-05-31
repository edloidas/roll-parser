const { parseAny } = require( '../../src/parser' );
const { testParse } = require( '../util' );

testParse(
  parseAny,
  'Parse `simple`, `classic`, and WoD notations:',
  [ '2 10 -1', '2d10-1', 'D10>8f1' ],
  [ '1 D 2' ],
);
