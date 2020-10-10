import parseSimpleRoll from '../../src/complex/parseSimpleRoll';

describe( 'Parse simple notation and return roll object:', () => {
  test( 'Should successfully parse simple roll', () => {
    expect( parseSimpleRoll( '2 10 -1' )).toEqual({ dice: 10, count: 2, modifier: -1 });
  });
});
