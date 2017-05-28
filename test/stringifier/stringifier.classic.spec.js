const { testClassicNotation } = require( '../util' );

describe( 'Roll `classic` notation:', () => {
  testClassicNotation( 'd20', 20 );
  testClassicNotation( 'd20', 20, 1 );
  testClassicNotation( 'd20', 20, 1, 0 );
  testClassicNotation( 'd20', 20, null, null );

  testClassicNotation( '2d10', 10, 2 );
  testClassicNotation( '2d10', 10, 2, 0 );

  testClassicNotation( 'd6+1', 6, 1, 1 );
  testClassicNotation( '4d6+1', 6, 4, 1 );
  testClassicNotation( '10d99-77', 99, 10, -77 );
});
