const grammar = require( '../../src/grammar' );
const util = require( '../util' );

const testRolls = util.testRolls;

const [
  singleRoll, //mutliRolls, modifiedRolls,
  // rollsWithBottomLimit,
  // rollsWithBottomAndUpperLimit,
] = [ ...grammar.classic ];

testRolls(
  singleRoll,
  'Default roll "dX"',
  [ 'd20', 'D6' ],
  [ '20', 'd-10', 'D 6' ],
);
