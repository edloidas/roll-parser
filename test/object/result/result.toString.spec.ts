import Result from '../../../src/object/Result';

describe( 'Result.toString:', () => {
  test( 'Should generate notation `(4d10+1) 21 [10,2,7,1]`.', () => {
    expect( new Result( '4d10+1', 21, [ 10, 2, 7, 1 ]).toString()).toEqual( '(4d10+1) 21 [10,2,7,1]' );
  });
});
