import Roll from '../../../src/object/Roll';

describe( 'Roll.toString:', () => {
  test( 'Should generate roll `2d20-2`.', () => {
    expect( new Roll( 20, 2, -2 ).toString()).toEqual( '2d20-2' );
  });
});
