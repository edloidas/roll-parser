const WodRoll = require( '../../../src/object/WodRoll' );

describe( 'WodRoll generation:', () => {
  test( 'Should generate `d10>6` roll without parameters.', () => {
    const result = { dice: 10, count: 1, again: false, success: 6, fail: 0 };
    expect( new WodRoll()).toEqual( result );
  });

  test( 'Should generate normal roll `2d20!>9f2`.', () => {
    const result = { dice: 20, count: 2, again: true, success: 9, fail: 2 };
    expect( new WodRoll( 20, 2, true, 9, 2 )).toEqual( result );
  });

  test( 'Should fix border for success or fail zero values.', () => {
    const result = { dice: 10, count: 2, again: true, success: 10, fail: 0 };
    expect( new WodRoll( 10, 2, true, 0, 0 )).toEqual( result );
  });

  test( 'Should fix border, if success or fail is out of range.', () => {
    const result = { dice: 10, count: 2, again: true, success: 10, fail: 0 };
    expect( new WodRoll( 10, 2, true, 11, -1 )).toEqual( result );
  });

  test( 'Should fix fail value, when it equals or greater than success.', () => {
    const result = { dice: 10, count: 2, again: true, success: 5, fail: 4 };
    expect( new WodRoll( 10, 2, true, 5, 5 )).toEqual( result );
  });

  test( 'Should fix border, if success and fail is out of range and fail > success.', () => {
    const result = { dice: 10, count: 2, again: true, success: 10, fail: 9 };
    expect( new WodRoll( 10, 2, true, 11, 12 )).toEqual( result );
  });
});
