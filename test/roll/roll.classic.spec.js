const testClassicNotation = require( '../util' ).classicNotation;

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

  testClassicNotation( '4d10-3 (3)', 10, 4, -3, 3 );
  testClassicNotation( '4d10-3 (7,9)', 10, 4, -3, 7, 9 );

  testClassicNotation( '4d20-3 (15,15)', 20, 4, -3, 21, 15 );

  testClassicNotation( '4d10-3 (3)', 10, 4, -3, 3, 0 );
  testClassicNotation( '4d10-3 (3)', 10, 4, -3, 3, -4 );

  testClassicNotation( '4d10-3 (3)', 10, 4, -3, 3, Number.MAX_SAFE_INTEGER );
  testClassicNotation( '4d10-3 (3)', 10, 4, -3, 3, null );
  testClassicNotation( '4d10-3 (3)', 10, 4, -3, 3, undefined );
  testClassicNotation( '4d10-3 (3)', 10, 4, -3, 3, NaN );

  testClassicNotation( '4d10-3 (,9)', 10, 4, -3, 0, 9 );
  testClassicNotation( '4d10-3 (,9)', 10, 4, -3, null, 9 );
  testClassicNotation( '4d10-3 (,9)', 10, 4, -3, undefined, 9 );
  testClassicNotation( '4d10-3 (,9)', 10, 4, -3, NaN, 9 );

  testClassicNotation( '4d10-3', 10, 4, -3, 0, 11 );
  testClassicNotation( '4d10-3 (4)', 10, 4, -3, 4, 11 );
});
