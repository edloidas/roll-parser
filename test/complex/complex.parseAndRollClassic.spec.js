const parseAndRollClassic = require( '../../src/complex/parseAndRollClassic' );
const Result = require( '../../src/object/Result' );

describe( 'Parse classic notation, roll the dice and return result object:', () => {
  test( 'Should successfully parse and roll classic roll', () => {
    const result = parseAndRollClassic( '2d10+1' );
    expect( result.notation ).toEqual( '2d10+1' );
    expect( result.value ).toBeGreaterThanOrEqual( 3 );
    expect( result ).toBeInstanceOf( Result );
  });
});
