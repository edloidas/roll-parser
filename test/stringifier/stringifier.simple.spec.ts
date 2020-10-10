import { testSimpleNotation } from '../util';

describe( 'Roll `simple` notation:', () => {
  testSimpleNotation( '20', 20 );
  testSimpleNotation( '20', 20, 1 );
  testSimpleNotation( '20', 20, 1, 0 );
  testSimpleNotation( '20', 20, null, null );

  testSimpleNotation( '2 10', 10, 2 );

  testSimpleNotation( '4 6 1', 6, 4, 1 );
  testSimpleNotation( '10 99 -77', 99, 10, -77 );
});
