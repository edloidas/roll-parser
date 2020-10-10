import { normalizeInteger } from '../../src/normalizer';

describe( 'Fix invalid non-integer value (default = 0):', () => {
  test( '`undefined` should be replaced with 0', () => {
    expect( normalizeInteger( undefined )).toEqual( 0 );
  });

  test( '`null` should be replaced with 0', () => {
    expect( normalizeInteger( null )).toEqual( 0 );
  });

  test( '`NaN` should be replaced with 0', () => {
    expect( normalizeInteger( NaN )).toEqual( 0 );
  });

  test( 'Non-integer (string) should be replaced with 0', () => {
    expect( normalizeInteger( '2' )).toEqual( 0 );
  });

  test( 'Non-integer (array) should be replaced with 0', () => {
    expect( normalizeInteger([ 1 ])).toEqual( 0 );
  });

  test( 'Valid positive integer should not be changed', () => {
    expect( normalizeInteger( 20 )).toEqual( 20 );
  });

  test( 'Valid negative integer should not be changed', () => {
    expect( normalizeInteger( -20 )).toEqual( -20 );
  });
});
