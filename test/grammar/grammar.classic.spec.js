const grammar = require( '../../src/grammar' );
const testRolls = require( '../util' ).testRolls;

const [
  classicRolls,
  rollsWithBottomLimit,
  rollsWithLimits,
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

testRolls(
  rollsWithBottomLimit,
  'Rolls with bottom limit: "YdX (A)" or "YdX (A,)"',
  [ '20d20 (6)', '2D6  ( 11 )', 'd20 (4)' ],
  [ '1d20 ()', '1d20 (,6)' ],
);

testRolls(
  rollsWithLimits,
  'Rolls with limits (upper or both): "YdX (,B)" or "YdX (A,B)"',
  [ '20d20 (,6)', '2D6  ( , 11 )', '20d20 (6,11)', '2D6  ( 6 , 11 )', 'd20 (,17)', 'd20 (4,17)' ],
  [ '1d20 (6,)' ],
);

testRolls(
  rollsWithBottomLimit,
  'Rolls with modifier and bottom limit: "YdX±Z (A) or "YdX±Z (A,)""',
  [ '20d20+17 (6)', '2D6-1  ( 11 )', 'd20+3 (4)' ],
  [ '1d20+0 ()', '1d20+0 (,6)' ],
);

testRolls(
  rollsWithLimits,
  'Rolls with modifier and limits (upper or both): "YdX±Z (,B)" or "YdX±Z (A,B)"',
  [ '20d20+17 (,6)', '2D6-1  ( , 11 )', '20d20+17 (6,11)', '2D6-1  ( 6 , 11 )', 'd20+4 (,17)', 'd20+4 (4,17)' ],
  [ '1d20+0 (6,)' ],
);
