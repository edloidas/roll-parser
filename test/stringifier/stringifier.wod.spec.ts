import { testWodNotation } from '../util';

describe( 'Roll `WoD` notation:', () => {
  testWodNotation( 'd10>6', 10 );
  testWodNotation( '3d10>6', 10, 3 );
  testWodNotation( '3d10!>6', 10, 3, true );
  testWodNotation( '3d10!>8', 10, 3, true, 8 );
  testWodNotation( '3d10!>8f1', 10, 3, true, 8, 1 );
  testWodNotation( 'd10>7f3', 10, 1, false, 7, 3 );
});
