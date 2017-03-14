const grammar = require( '../../src/grammar' );
const util = require( '../util' );

const [ single, double, triple ] = [ ...grammar.simple ];

const testRolls = ( regexp, desc, validRolls, invalidRolls ) => {
  describe( desc, () => {
    const parseValid = util.validRoll( regexp );
    validRolls.forEach( parseValid );

    const parseInvalid = util.invalidRoll( regexp );
    invalidRolls.forEach( parseInvalid );
  });
};

testRolls(
  single,
  'One value roll',
  [ '1', '123456789' ],
  [ '-2' ],
);

testRolls(
  double,
  'Two values roll',
  [ '1 2', '123    12345' ],
  [ '0', '-2', '2 -20', '-10 1', '-10 -20' ],
);

testRolls(
  triple,
  'Three values roll',
  [ '1 2 3', '1 20 0', '2  10  +11', '2  10  -11' ],
  [ '0', '-2', '2 -20', '-10 1', '-10 -20', '2 -20 1', '-10 1 2', '-10 -20 3' ],
);
