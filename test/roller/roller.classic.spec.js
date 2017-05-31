const { rollClassic } = require( '../../src/roller' );
const Roll = require( '../../src/object/Roll' );
const Result = require( '../../src/object/Result' );

describe( 'Rolling classic roll:', () => {
  test( 'Should generate 6 values for `6d10` roll.', () => {
    const result = rollClassic( new Roll( 10, 6, 0 ));
    expect( result.rolls.length ).toEqual( 6 );
    expect( result.notation ).toEqual( '6d10' );
  });

  test( 'Should generate exact value for `5d1+10` roll.', () => {
    const result = rollClassic( new Roll( 1, 5, 10 ));
    expect( result.value ).toEqual( 15 );
    expect( result.notation ).toEqual( '5d1+10' );
  });

  test( 'Should not generate identical values.', () => {
    const result = rollClassic( new Roll( 1000, 10, 0 ));
    const allIdentical = result.rolls.every(( value, i, arr ) => value === arr[ 0 ]);
    expect( allIdentical ).toBeFalsy();
  });

  test( 'Should return result for non-standard or invalid rolls.', () => {
    expect( rollClassic( null )).toBeInstanceOf( Result );
    expect( rollClassic({ dice: 10, count: 6, modifier: 0 })).toBeInstanceOf( Result );
    expect( rollClassic({ dice: 10, count: 6, fail: 1 })).toBeInstanceOf( Result );
  });
});
