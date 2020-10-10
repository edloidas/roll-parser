import { normalizeTop } from '../../src/normalizer';

describe( 'Normalize top border:', () => {
  test( 'Out of border value (negative) should be changed to maximum value', () => {
    expect( normalizeTop( 10 )( -5 )).toEqual( 10 );
  });

  test( 'Out of border value (0) should be changed to MAX_SAFE_INTEGER', () => {
    expect( normalizeTop( 10 )( 0 )).toEqual( 10 );
  });

  test( 'Valid number should not be changed', () => {
    expect( normalizeTop( 20 )( 10 )).toEqual( 10 );
    expect( normalizeTop( 20 )( 1 )).toEqual( 1 );
  });
});
