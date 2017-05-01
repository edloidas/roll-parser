const { makeParser } = require( '../../src/parser' );

describe( 'Making unary parser:', () => {
  // test( 'Should cover `unary` path for single RegExp.', () => {
  //   expect( makeParser( /\d+/ )( '123' )).toEqual( expect.arrayContaining([ '123' ]));
  // });

  test( 'Should cover `unary` path for unary array.', () => {
    expect( makeParser([ /\d+/ ])( '123' )).toEqual( expect.arrayContaining([ '123' ]));
  });
});
