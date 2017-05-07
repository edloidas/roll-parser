const { normalizeBottom } = require( '../../src/normalizer' );

describe( 'Normalize bottom border:', () => {
  const TOP = 20;
  const getBottom = bottom => normalizeBottom( TOP )( bottom )[ 0 ];

  test( 'Negative value should be changed to 0', () => {
    expect( getBottom( -5 )).toEqual( 0 );
  });

  test( 'Zero value should not be changed', () => {
    expect( getBottom( 0 )).toEqual( 0 );
  });

  test( 'Bottom border should not be greater than top border', () => {
    expect( getBottom( TOP * 2 )).toEqual( TOP );
  });

  test( 'Valid number should not be changed', () => {
    expect( getBottom( 3 )).toEqual( 3 );
  });
});
