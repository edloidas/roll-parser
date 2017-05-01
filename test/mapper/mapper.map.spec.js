const { map } = require( '../../src/mapper' );

describe( 'Map parser result:', () => {
  test( 'Should map falsy values to `null`', () => {
    expect( map( null )).toBeNull();
  });

  test( 'Should map zero result to `null`', () => {
    expect( map([ 'skipped' ])).toBeNull();
  });

  test( 'Should map valid sparse result (with `undefined` values)', () => {
    expect( map([ 'd10', '', '10', undefined ])).toMatchObject([ null, 10, null ]);
  });

  test( 'Should map valid result', () => {
    expect( map([ '2d10+1', '2', '10', '+1' ])).toMatchObject([ 2, 10, 1 ]);
    expect( map([ '2d10!>8f1', '2', '10', '!', '8', '1' ])).toMatchObject([ 2, 10, '!', 8, 1 ]);
  });

  test( 'Should trim excess values', () => {
    expect( map([ 'skipped', '2', '10', '-2', '2', '17', '9' ])).toEqual([ 2, 10, -2, 2, 17 ]);
  });
});
