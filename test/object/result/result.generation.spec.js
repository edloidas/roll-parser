const Result = require( '../../../src/object/Result' );

describe( 'Result generation:', () => {
  test( 'Should generate valid result.', () => {
    const result = { notation: '4d10+1', value: 21, rolls: [ 10, 2, 7, 1 ] };
    expect( new Result( '4d10+1', 21, [ 10, 2, 7, 1 ])).toEqual( result );
  });
});
