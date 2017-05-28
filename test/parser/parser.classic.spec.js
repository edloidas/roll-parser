const { parseClassic } = require( '../../src/parser' );
const { testParse } = require( '../util' );

testParse(
  parseClassic,
  'Parse `classic` notation:',
  [ 'd6', '2d10', '1D20-3' ],
  [ '0 d1' ],
);
