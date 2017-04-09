const { normalizeTop } = require( '../../src/normalizers' );

describe( 'Normalize top border:', () => {
  test( 'Out of border value (negative) should be changed to 1', () => {
    expect( normalizeTop( -5 )).toEqual( 1 );
  });

  test( 'Out of border value (0) should be changed to 1', () => {
    expect( normalizeTop( 0 )).toEqual( 1 );
  });

  test( 'Valid number should not be changed', () => {
    expect( normalizeTop( 20 )).toEqual( 20 );
  });
});
