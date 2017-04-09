const { normalizeTop } = require( '../../src/normalizers' );

describe( 'Normalize top border:', () => {
  test( 'Out of border value (negative) should be changed to MAX_SAFE_INTEGER', () => {
    expect( normalizeTop( -5 )).toEqual( Number.MAX_SAFE_INTEGER );
  });

  test( 'Out of border value (0) should be changed to MAX_SAFE_INTEGER', () => {
    expect( normalizeTop( 0 )).toEqual( Number.MAX_SAFE_INTEGER );
  });

  test( 'Valid number should not be changed', () => {
    expect( normalizeTop( 20 )).toEqual( 20 );
  });
});
