const { orderArguments } = require( '../../src/mapper' );

describe( 'Order arguments:', () => {
  test( 'Should return null for falsy input', () => {
    expect( orderArguments( null )).toBeNull();
    expect( orderArguments( undefined )).toBeNull();
  });

  test( 'Should return unary array for single values', () => {
    expect( orderArguments([ 10 ])).toEqual([ 10 ]);
    expect( orderArguments([ 10, null ])).toEqual([ 10 ]);
  });

  test( 'Should swap second and first values, leaving other unchanged', () => {
    expect( orderArguments([ 2, 10 ])).toEqual([ 10, 2 ]);
    expect( orderArguments([ 2, 10, '!' ])).toEqual([ 10, 2, '!' ]);
    expect( orderArguments([ 2, 10, '!', 6 ])).toEqual([ 10, 2, '!', 6 ]);
    expect( orderArguments([ 2, 10, -2, 1, 6 ])).toEqual([ 10, 2, -2, 1, 6 ]);
  });

  test( 'Should trim excess values (> 5)', () => {
    expect( orderArguments([ 2, 10, -2, 1, 6, 7 ])).toEqual([ 10, 2, -2, 1, 6 ]);
  });
});
