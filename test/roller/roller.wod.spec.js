const { rollWod } = require( '../../src/roller' );
const WodRoll = require( '../../src/object/WodRoll' );

describe( 'Rolling WoD roll:', () => {
  test( 'Should generate 6 values for `6d10>6` roll.', () => {
    const result = rollWod( new WodRoll( 10, 6 ));
    expect( result.rolls.length ).toEqual( 6 );
    expect( result.notation ).toEqual( '6d10>6' );
  });

  test( 'Should generate exact value for `d1!>1` roll without infinite loop.', () => {
    const result = rollWod( new WodRoll( 1, 1, true, 1 ));
    expect( result.value ).toEqual( 101 );
    expect( result.notation ).toEqual( 'd1!>1' );
  });
});
