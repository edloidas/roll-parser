const { normalizeBorders } = require( '../../src/normalizers' );

describe( 'Normalize borders:', () => {
  test( 'Should return array for valid borders', () => {
    expect( normalizeBorders( 3, 19 )).toEqual([ 3, 19 ]);
  });
});
