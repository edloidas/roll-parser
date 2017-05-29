const { rollAny } = require( '../../src/roller' );
const Roll = require( '../../src/object/Roll' );
const WodRoll = require( '../../src/object/WodRoll' );

describe( 'Rolling WoD or classic roll:', () => {
  test( 'Should generate 6 values for classic roll.', () => {
    const result = rollAny( new Roll( 10, 6 ));
    expect( result.rolls.length ).toEqual( 6 );
    expect( result.notation ).toEqual( '6d10' );
  });

  test( 'Should generate 2 values for WoD roll.', () => {
    const result = rollAny( new WodRoll( 10, 2 ));
    expect( result.rolls.length ).toEqual( 2 );
    expect( result.notation ).toEqual( '2d10>6' );
  });

  test( 'Should return `null` for non-standard or invalid rolls.', () => {
    expect( rollAny( null )).toBeNull();
    expect( rollAny({ dice: 10, count: 6, modifier: 0 })).toBeNull();
  });
});
