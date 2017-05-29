const parseAndRollSimple = require( '../../src/complex/parseAndRollSimple' );
const Result = require( '../../src/object/Result' );

describe( 'Parse simple notation, roll the dice and return result object:', () => {
  test( 'Should successfully parse and roll simple roll', () => {
    const result = parseAndRollSimple( '2 10 1' );
    expect( result.notation ).toEqual( '2d10+1' );
    expect( result.value ).toBeGreaterThanOrEqual( 3 );
    expect( result ).toBeInstanceOf( Result );
  });
});
