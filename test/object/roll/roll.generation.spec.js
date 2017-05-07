const Roll = require( '../../../src/object/Roll' );

describe( 'Roll generation:', () => {
  test( 'Should generate `d20` roll without parameters.', () => {
    const result = { dice: 20, count: 1, modifier: 0, bottom: 0, top: 20 };
    expect( new Roll()).toEqual( result );
  });

  test( 'Should generate normal roll `2d10-2 (2,9)`.', () => {
    const result = { dice: 10, count: 2, modifier: -2, bottom: 2, top: 9 };
    expect( new Roll( 10, 2, -2, 2, 9 )).toEqual( result );
  });

  test( 'Should replace zero borders with 1 for roll `4d6+1 (0,0)`.', () => {
    const result = { dice: 6, count: 4, modifier: 1, bottom: 0, top: 6 };
    expect( new Roll( 6, 4, 1, 0, 0 )).toEqual( result );
  });

  test( 'Should fix border, if bottom limmit is bigger than upper limit`.', () => {
    const result = { dice: 12, count: 3, modifier: -4, bottom: 5, top: 5 };
    expect( new Roll( 12, 3, -4, 9, 5 )).toEqual( result );
  });

  test( 'Should fix border, if top limmit is bigger than dice value`.', () => {
    const result = { dice: 12, count: 3, modifier: -4, bottom: 5, top: 12 };
    expect( new Roll( 12, 3, -4, 5, 17 )).toEqual( result );
  });
});
