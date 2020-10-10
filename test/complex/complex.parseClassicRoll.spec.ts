import parseClassicRoll from '../../src/complex/parseClassicRoll';

describe( 'Parse classic notation and return roll object:', () => {
  test( 'Should successfully parse classic roll', () => {
    expect( parseClassicRoll( '2d10-1' )).toEqual({ dice: 10, count: 2, modifier: -1 });
  });
});
