const grammar = require( '../../src/grammar' );
const testRolls = require( '../util' ).testRolls;

const [
  classicRolls,
] = [ ...grammar.classic ];

testRolls(
  classicRolls,
  'Default roll: "dX"',
  [ 'd20', 'D6' ],
  [ '20', 'd-10', 'D 6' ],
);

testRolls(
  classicRolls,
  'Multiple rolls: "YdX"',
  [ '20d20', '2D6' ],
  [ '2d-10', '1 D6' ],
);

testRolls(
  classicRolls,
  'Rolls with modifier: "YdX±Z"',
  [ '20d20+17', '2D6-1', 'd20+3' ],
  [ '1d20 +0', '2d10 5', '1D6-' ],
);
