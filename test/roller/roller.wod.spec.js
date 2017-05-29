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

  test( 'Should fail all rolls.', () => {
    const roll = Object.assign({}, new WodRoll( 1, 1, false, 1 ), { success: 2, fail: 1 });
    const result = rollWod( roll );
    expect( result.value ).toEqual( 0 );
  });
});
