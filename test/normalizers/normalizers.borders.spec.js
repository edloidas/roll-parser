const { normalizeBorders } = require( '../../src/normalizer' );

describe( 'Normalize borders:', () => {
  test( 'Should return array for valid borders', () => {
    expect( normalizeBorders( 3, 19, 20 )).toEqual([ 3, 19 ]);
  });

  test( 'Borders should not be greater than max value', () => {
    expect( normalizeBorders( 3, 19, 10 )).toEqual([ 3, 10 ]);
    expect( normalizeBorders( 12, 19, 10 )).toEqual([ 10, 10 ]);
  });
});
