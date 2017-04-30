const grammar = require( '../../src/grammar' );
const testRolls = require( '../util' ).testRolls;

const [
  wodRolls,
  wodSuccessRolls,
] = [ ...grammar.wod ];

testRolls(
  wodRolls,
  'Default roll "dX"',
  [ 'd20', 'D6', 'd10!' ],
  [ '20', 'd-10', 'D 6' ],
);

testRolls(
  wodRolls,
  'Multiple rolls: "YdX"',
  [ '20d20', '2D6', '5d10!' ],
  [ '2d-10', '1 D6' ],
);

testRolls(
  wodSuccessRolls,
  'Success rolls with bottom limit:  "YdX!>A"',
  [ '20d20>6', 'D10>8', '4d10!>4' ],
  [ '4d10>' ],
);

testRolls(
  wodSuccessRolls,
  'Success rolls with bottom limit and failure:  "YdX!>AfB"',
  [ '20d20>6f1', 'D10>8f2', '4d10!>4f3' ],
  [ '4d10>6f' ],
);
