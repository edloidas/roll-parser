const { testResultNotation } = require( '../util' );

describe( 'Roll result notation:', () => {
  testResultNotation( '(4d10+1) 21 [10,2,7,1]', '4d10+1', 21, [ 10, 2, 7, 1 ]);
});
