import parseAndRoll from '../../src/complex/parseAndRoll';
import Result from '../../src/object/Result';

describe( 'Parse any notation, roll the dice and return result object:', () => {
  test( 'Should successfully parse and roll simple roll', () => {
    const result = parseAndRoll( '2 10 1' );
    expect( result.notation ).toEqual( '2d10+1' );
    expect( result.value ).toBeGreaterThanOrEqual( 3 );
    expect( result ).toBeInstanceOf( Result );
  });

  test( 'Should successfully parse and roll classic roll', () => {
    const result = parseAndRoll( '2d10+1' );
    expect( result.notation ).toEqual( '2d10+1' );
    expect( result.value ).toBeGreaterThanOrEqual( 3 );
    expect( result ).toBeInstanceOf( Result );
  });

  test( 'Should successfully parse and roll WoD roll', () => {
    const result = parseAndRoll( '2d10!>6f1' );
    expect( result.notation ).toEqual( '2d10!>6f1' );
    expect( result ).toBeInstanceOf( Result );
  });

  test( 'Should not parse unknown notation', () => {
    expect( parseAndRoll( 'xyz' )).toBeNull();
  });
});
