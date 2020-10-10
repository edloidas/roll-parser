import { makeParser } from '../../src/parser';
import Type from '../../src/object/Type';

describe( 'Making unary parser:', () => {
  test( 'Should cover `unary` path for single RegExp.', () => {
    expect( makeParser([ /\d+/ ], Type.simple )( '123' )).toEqual( expect.arrayContaining([ '123' ]));
  });

  test( 'Should cover `unary` path for unary array.', () => {
    expect( makeParser([ /\d+/ ], Type.simple )( '123' )).toEqual( expect.arrayContaining([ '123' ]));
  });
});
