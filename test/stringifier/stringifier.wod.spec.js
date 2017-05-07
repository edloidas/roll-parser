const { testWodNotation } = require( '../util' );

describe( 'Roll `WoD` notation:', () => {
  testWodNotation( 'd10>6f1', 10 );
  testWodNotation( '3d10>6f1', 10, 3 );
  testWodNotation( '3d10!>6f1', 10, 3, true );
  testWodNotation( '3d10!>8f1', 10, 3, true, 8 );
  testWodNotation( '3d10!>8f2', 10, 3, true, 8, 2 );
});
