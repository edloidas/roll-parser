import WodRoll from '../../../src/object/WodRoll';

describe( 'WodRoll.toString:', () => {
  test( 'Should generate roll `2d20!>9f2`.', () => {
    expect( new WodRoll( 20, 2, true, 9, 2 ).toString()).toEqual( '2d20!>9f2' );
  });
});
