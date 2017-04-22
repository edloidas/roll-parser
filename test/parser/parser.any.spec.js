const { parseAny } = require( '../../src/parser' );
const { testParse } = require( '../util' );

testParse(
  parseAny,
  'Parse both `simple` and `classic` notation:',
  [ '2 10 -1', '2d10-1' ],
  [ '1 D 2' ],
);
