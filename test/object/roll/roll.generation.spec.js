const Roll = require( '../../../src/object/Roll' );

describe( 'Roll generation:', () => {
  test( 'Should generate `d20` roll without parameters.', () => {
    const result = { dice: 20, count: 1, modifier: 0 };
    expect( new Roll()).toEqual( result );
  });

  test( 'Should generate normal roll `2d10-2`.', () => {
    const result = { dice: 10, count: 2, modifier: -2 };
    expect( new Roll( 10, 2, -2 )).toEqual( result );
  });
});
