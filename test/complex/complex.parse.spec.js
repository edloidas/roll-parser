const parse = require( '../../src/complex/parse' );

describe( 'Parse any notation and return roll object:', () => {
  test( 'Should parse simple roll', () => {
    expect( parse( '2 10 -1' )).toEqual({ dice: 10, count: 2, modifier: -1 });
  });

  test( 'Should parse classic roll', () => {
    expect( parse( '2d10+1' )).toEqual({ dice: 10, count: 2, modifier: 1 });
  });

  test( 'Should parse WoD roll', () => {
    expect( parse( '4d10!>8f1' )).toEqual({ dice: 10, count: 4, again: true, success: 8, fail: 1 });
  });

  test( 'Should not parse unknown types', () => {
    expect( parse( 'xyz' )).toBeNull();
  });
});
