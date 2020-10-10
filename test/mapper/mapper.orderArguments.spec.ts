import { orderArguments } from '../../src/mapper';

describe( 'Order arguments:', () => {
  test( 'Should return null for falsy input', () => {
    expect( orderArguments( 3 )( null )).toBeNull();
    expect( orderArguments( 3 )( undefined )).toBeNull();
  });

  test( 'Should return unary array for single values', () => {
    expect( orderArguments( 3 )([ 10 ])).toEqual([ 10 ]);
    expect( orderArguments( 3 )([ 10, null ])).toEqual([ 10 ]);
  });

  test( 'Should swap second and first values, leaving other unchanged', () => {
    expect( orderArguments( 5 )([ 2, 10 ])).toEqual([ 10, 2 ]);
    expect( orderArguments( 5 )([ 2, 10, '!' ])).toEqual([ 10, 2, '!' ]);
    expect( orderArguments( 5 )([ 2, 10, '!', 6 ])).toEqual([ 10, 2, '!', 6 ]);
    expect( orderArguments( 5 )([ 2, 10, '!', 6, 1 ])).toEqual([ 10, 2, '!', 6, 1 ]);
  });

  test( 'Should trim excess values (> 3)', () => {
    expect( orderArguments( 3 )([ 2, 10, -2, 1, 6 ])).toEqual([ 10, 2, -2 ]);
  });

  test( 'Should trim excess values (> 5)', () => {
    expect( orderArguments( 5 )([ 2, 10, '!', 6, 1, 7 ])).toEqual([ 10, 2, '!', 6, 1 ]);
  });
});
