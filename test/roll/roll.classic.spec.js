const testClassicNotation = require( '../util' ).classicNotation;

describe( 'Roll `classic` notation:', () => {
  testClassicNotation( 'd20', 20 );

  testClassicNotation( '2d10', 10, 2 );

  testClassicNotation( '4d6+1', 6, 4, 1 );
  testClassicNotation( '10d99-77', 99, 10, -77 );

  testClassicNotation( '4d10-3 (3)', 10, 4, -3, 3 );
  testClassicNotation( '4d10-3 (7,21)', 10, 4, -3, 7, 21 );

  testClassicNotation( '4d10-3 (15,15)', 10, 4, -3, 21, 15 );

  testClassicNotation( '4d10-3 (3)', 10, 4, -3, 3, 0 );
  testClassicNotation( '4d10-3 (3)', 10, 4, -3, 3, -4 );

  testClassicNotation( '4d10-3 (3)', 10, 4, -3, 3, Number.MAX_SAFE_INTEGER );
  testClassicNotation( '4d10-3 (3)', 10, 4, -3, 3, null );
  testClassicNotation( '4d10-3 (3)', 10, 4, -3, 3, undefined );
  testClassicNotation( '4d10-3 (3)', 10, 4, -3, 3, NaN );

  testClassicNotation( '4d10-3 (,35)', 10, 4, -3, 0, 35 );
  testClassicNotation( '4d10-3 (,35)', 10, 4, -3, null, 35 );
  testClassicNotation( '4d10-3 (,35)', 10, 4, -3, undefined, 35 );
  testClassicNotation( '4d10-3 (,35)', 10, 4, -3, NaN, 35 );
});
