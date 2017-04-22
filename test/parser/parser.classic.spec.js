const { parseClassic } = require( '../../src/parser' );
const { testParse } = require( '../util' );

testParse(
  parseClassic,
  'Parse `classic` notation:',
  [ 'd6', '2d10', '1d20-3', '2D8+2 (1)', '2d8+2 (,9)', '2D8+2 (2,7)' ],
  [ '0 d1' ],
);
