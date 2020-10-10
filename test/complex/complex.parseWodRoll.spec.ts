import parseWodRoll from '../../src/complex/parseWodRoll';

describe( 'Parse WoD notation and return roll object:', () => {
  test( 'Should successfully parse WoD roll', () => {
    expect( parseWodRoll( '2d10!>8f1' )).toEqual({ dice: 10, count: 2, again: true, success: 8, fail: 1 });
  });
});
