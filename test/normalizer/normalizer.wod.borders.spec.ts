import { normalizeWodBorders } from '../../src/normalizer';

describe( 'Normalize WoD borders:', () => {
  test( 'Should return array for valid borders', () => {
    expect( normalizeWodBorders( 3, 19, 20 )).toEqual([ 3, 19 ]);
  });

  test( 'Borders should not be greater than max value', () => {
    expect( normalizeWodBorders( 3, 19, 10 )).toEqual([ 3, 10 ]);
  });

  test( 'Bottom border should be less than top border value', () => {
    expect( normalizeWodBorders( 15, 15, 20 )).toEqual([ 14, 15 ]);
    expect( normalizeWodBorders( 12, 19, 10 )).toEqual([ 9, 10 ]);
  });
});
