const { fixInvalid } = require( '../../src/normalizers' );

describe( 'Fix invalid border (backup = 0):', () => {
  const fixInvalid0 = fixInvalid( 0 );

  test( '`undefined` should be replaced with 0', () => {
    expect( fixInvalid0( undefined )).toEqual( 0 );
  });

  test( '`null` should be replaced with 0', () => {
    expect( fixInvalid0( null )).toEqual( 0 );
  });

  test( '`NaN` should be replaced with 0', () => {
    expect( fixInvalid0( NaN )).toEqual( 0 );
  });

  test( 'Non-integer (string) should be replaced with 0', () => {
    expect( fixInvalid0( '2' )).toEqual( 0 );
  });

  test( 'Non-integer (array) should be replaced with 0', () => {
    expect( fixInvalid0([ 1 ])).toEqual( 0 );
  });

  test( 'Valid number should not be changed', () => {
    expect( fixInvalid0( 20 )).toEqual( 20 );
  });
});
