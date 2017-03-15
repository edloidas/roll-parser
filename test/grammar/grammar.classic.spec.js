const grammar = require( '../../src/grammar' );
const testRolls = require( '../util' ).testRolls;

const [
  singleRoll, mutliRolls, modifiedRolls,
  rollsWithBottomLimit,
  rollsWithLimits,
  modifiedRollsWithBottomLimit,
  modifiedRollsWithLimits,
] = [ ...grammar.classic ];

testRolls(
  singleRoll,
  'Default roll "dX"',
  [ 'd20', 'D6' ],
  [ '20', 'd-10', 'D 6' ],
);

testRolls(
  mutliRolls,
  'Multiple rolls: "ydX"',
  [ '20d20', '2D6' ],
  [ '2d-10', '1 D6' ],
);

testRolls(
  modifiedRolls,
  'Mutliple rolls with modifier: "YdX±Z"',
  [ '20d20+17', '2D6-1' ],
  [ '1d20 +0', '2d10 5', '1D6-' ],
);

testRolls(
  rollsWithBottomLimit,
  'Mutliple rolls with bottom limit: "YdX (A)" or "YdX (A,)"',
  [ '20d20 (6)', '2D6  ( 11 )' ],
  [ '1d20+0 (6)', '1d20 ()', '1d20 (,6)' ],
);

testRolls(
  rollsWithLimits,
  'Mutliple rolls with limits (upper or both): "YdX (,B)" or "YdX (A,B)"',
  [ '20d20 (,6)', '2D6  ( , 11 )', '20d20 (6,11)', '2D6  ( 6 , 11 )' ],
  [ '1d20+0 (6,11)', '1d20 (6,)' ],
);

testRolls(
  modifiedRollsWithBottomLimit,
  'Mutliple rolls with modifier and bottom limit: "YdX±Z (A) or "YdX±Z (A,)""',
  [ '20d20+17 (6)', '2D6-1  ( 11 )' ],
  [ '1d20 (6)', '1d20+0 ()', '1d20+0 (,6)' ],
);

testRolls(
  modifiedRollsWithLimits,
  'Mutliple rolls with modifier and limits (upper or both): "YdX±Z (,B)" or "YdX±Z (A,B)"',
  [ '20d20+17 (,6)', '2D6-1  ( , 11 )', '20d20+17 (6,11)', '2D6-1  ( 6 , 11 )' ],
  [ '1d20 (6,11)', '1d20+0 (6,)' ],
);
