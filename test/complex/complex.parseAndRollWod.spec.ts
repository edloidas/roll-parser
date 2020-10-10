import parseAndRollWod from '../../src/complex/parseAndRollWod';
import Result from '../../src/object/Result';

describe( 'Parse WoD notation, roll the dice and return result object:', () => {
  test( 'Should successfully parse and roll WoD roll', () => {
    const result = parseAndRollWod( '2d10!>6f1' );
    expect( result.notation ).toEqual( '2d10!>6f1' );
    expect( result ).toBeInstanceOf( Result );
  });
});
