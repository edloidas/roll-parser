import { normalizeBottom } from '../../src/normalizer';

describe( 'Normalize bottom border:', () => {
  test( 'Negative value should be changed to 0', () => {
    expect( normalizeBottom( 20 )( -5 )).toEqual( 0 );
  });

  test( 'Zero value should not be changed', () => {
    expect( normalizeBottom( 20 )( 0 )).toEqual( 0 );
  });

  test( 'Bottom border should not be greater than top border', () => {
    expect( normalizeBottom( 20 )( 21 )).toEqual( 20 );
  });

  test( 'Valid number should not be changed', () => {
    expect( normalizeBottom( 20 )( 3 )).toEqual( 3 );
  });
});
