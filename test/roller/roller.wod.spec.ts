import { rollWod } from '../../src/roller';
import WodRoll from '../../src/object/WodRoll';
import Result from '../../src/object/Result';

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
    const roll = new WodRoll( 1, 1, false, 1 );
    roll.success = 2;
    roll.fail = 1;
    const result = rollWod( roll );
    expect( result.value ).toEqual( 0 );
  });

  test( 'Should return result for non-standard or invalid rolls.', () => {
    expect( rollWod( null )).toBeInstanceOf( Result );
    expect( rollWod({ dice: 10, count: 6, modifier: 0 })).toBeInstanceOf( Result );
    expect( rollWod({ dice: 10, count: 6, fail: 1 })).toBeInstanceOf( Result );
  });
});
