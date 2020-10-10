import { rollAny } from '../../src/roller';
import Roll from '../../src/object/Roll';
import WodRoll from '../../src/object/WodRoll';
import Result from '../../src/object/Result';

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

  test( 'Should return result for non-standard rolls.', () => {
    expect( rollAny({})).toBeInstanceOf( Result );
    expect( rollAny([])).toBeInstanceOf( Result );
    expect( rollAny( '' )).toBeInstanceOf( Result );
    expect( rollAny( '2d10-1' )).toBeInstanceOf( Result );
    expect( rollAny({ dice: 10, count: 6, modifier: 0 })).toBeInstanceOf( Result );
    expect( rollAny({ dice: 10, count: 6, fail: 1 })).toBeInstanceOf( Result );
  });

  test( 'Should return `null` for invalid rolls.', () => {
    expect( rollAny( null )).toBeFalsy();
    expect( rollAny( undefined )).toBeFalsy();
  });
});
