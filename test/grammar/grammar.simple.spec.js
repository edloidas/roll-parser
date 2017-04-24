const grammar = require( '../../src/grammar' );
const testRolls = require( '../util' ).testRolls;

const [
  singleOrDouble,
  tripleWithLimits,
] = [ ...grammar.simple ];

testRolls(
  singleOrDouble,
  'One value roll',
  [ '0', '123456789' ],
  [ '-2' ],
);

testRolls(
  singleOrDouble,
  'Two values roll',
  [ '1  2', '12 123' ],
  [ '-2', '2 -20', '-10 1', '-10 -20' ],
);

testRolls(
  tripleWithLimits,
  'Three values roll',
  [ '1 2 3', '2  10  +11', '2  10  -11' ],
  [ '0', '-2', '2 20', '2 -20', '-10 1', '-10 -20', '2 -20 1', '-10 1 2', '-10 -20 3', '2 20+3', '2 20-3' ],
);

testRolls(
  tripleWithLimits,
  'Three values with upper limit roll',
  [ '1 2 3 1', '2  10  +11  5', '2  10  -11  10' ],
  [ '1 2 3 -1', '1 2 3 +1' ],
);

testRolls(
  tripleWithLimits,
  'Three values with bottom and upper limit roll',
  [ '1 2 3 1 3', '2  10  +11  5  30', '2  10  -11  5  10' ],
  [ '1 2 3 1 -1', '1 2 3 1 +1' ],
);
