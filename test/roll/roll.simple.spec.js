const testSimpleNotation = require( '../util' ).simpleNotation;

describe( 'Roll `simple` notation:', () => {
  testSimpleNotation( '20', 20 );

  testSimpleNotation( '2 10', 10, 2 );

  testSimpleNotation( '4 6 1', 6, 4, 1 );
  testSimpleNotation( '10 99 -77', 99, 10, -77 );

  testSimpleNotation( '4 10 -3 3', 10, 4, -3, 3 );
  testSimpleNotation( '4 10 -3 3 9', 10, 4, -3, 3, 9 );

  testSimpleNotation( '4 20 -3 15 15', 20, 4, -3, 21, 15 );

  testSimpleNotation( '4 10 -3 3', 10, 4, -3, 3, 0 );
  testSimpleNotation( '4 10 -3 3', 10, 4, -3, 3, -4 );

  testSimpleNotation( '4 10 -3 3', 10, 4, -3, 3, Number.MAX_SAFE_INTEGER );
  testSimpleNotation( '4 10 -3 3', 10, 4, -3, 3, null );
  testSimpleNotation( '4 10 -3 3', 10, 4, -3, 3, undefined );
  testSimpleNotation( '4 10 -3 3', 10, 4, -3, 3, NaN );

  testSimpleNotation( '4 10 -3 0 9', 10, 4, -3, 0, 9 );
  testSimpleNotation( '4 10 -3 0 9', 10, 4, -3, null, 9 );
  testSimpleNotation( '4 10 -3 0 9', 10, 4, -3, undefined, 9 );
  testSimpleNotation( '4 10 -3 0 9', 10, 4, -3, NaN, 9 );

  testSimpleNotation( '4 10 -3 3', 10, 4, -3, 3, 11 );
  testSimpleNotation( '4 10 -3', 10, 4, -3, 0, 11 );
});
