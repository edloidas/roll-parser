const Roll = require( '../src/roll' );

describe( 'Roll validation:', () => {
  test( 'Should generate `d20` roll without parameters.', () => {
    const result = { dice: 20, count: 1, modifier: 0, bottom: 0, top: Number.MAX_SAFE_INTEGER };
    expect( new Roll()).toEqual( result );
  });

  test( 'Should generate normal roll `2d10-2 (2,17)`.', () => {
    const result = { dice: 10, count: 2, modifier: -2, bottom: 2, top: 17 };
    expect( new Roll( 10, 2, -2, 2, 17 )).toEqual( result );
  });

  test( 'Should replace zero borders with 1 for roll `4d6+1 (0,0)`.', () => {
    const result = { dice: 6, count: 4, modifier: 1, bottom: 0, top: 1 };
    expect( new Roll( 6, 4, 1, 0, 0 )).toEqual( result );
  });

  test( 'Should fix border, if bottom limmit is bigger than upper limit`.', () => {
    const result = { dice: 12, count: 3, modifier: -4, bottom: 5, top: 5 };
    expect( new Roll( 12, 3, -4, 9, 5 )).toEqual( result );
  });
});

describe( 'Roll `simple` notation:', () => {
});

describe( 'Roll `classic` notation:', () => {
  test( 'Should parse single roll `d20`.', () => {
    expect( new Roll( 20 ).toClassicNotation()).toBe( 'd20' );
  });
});
