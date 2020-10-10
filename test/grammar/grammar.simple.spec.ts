import grammar from '../../src/grammar';
const testRolls = require( '../util' ).testRolls;

const [ singleToTriple ] = [ ...grammar.simple ];

testRolls(
  singleToTriple,
  'One value roll',
  [ '0', '123456789' ],
  [ '-2' ],
);

testRolls(
  singleToTriple,
  'Two values roll',
  [ '1  2', '12 123' ],
  [ '-2', '2 -20', '-10 1', '-10 -20' ],
);

testRolls(
  singleToTriple,
  'Three values roll',
  [ '1 2 3', '2  10  +11', '2  10  -11' ],
  [ '-2', '2 -20', '-10 1', '-10 -20', '2 -20 1', '-10 1 2', '-10 -20 3', '2 20+3', '2 20-3', '1 2 3 4' ],
);
