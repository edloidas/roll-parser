const { parseWod } = require( '../../src/parser' );
const { mapToWodRoll } = require( '../../src/mapper' );

describe( 'Map parser result to WodRoll:', () => {
  test( 'Should map falsy values to `null`', () => {
    expect( mapToWodRoll( null )).toBeNull();
  });

  test( 'Should set dice for single value roll', () => {
    expect( mapToWodRoll( parseWod( 'd10' ))).toMatchObject({ dice: 10 });
  });

  test( 'Should map dice to second value and count to first value', () => {
    expect( mapToWodRoll( parseWod( '2d10' ))).toMatchObject({ dice: 10, count: 2 });
  });

  test( 'Should correctly map from 3 to 5 values', () => {
    expect( mapToWodRoll( parseWod( '2d20!' ))).toMatchObject({ dice: 20, count: 2, again: true });
    expect( mapToWodRoll( parseWod( '2d20>7' ))).toMatchObject({ dice: 20, count: 2, success: 7 });
    expect( mapToWodRoll( parseWod( '2d20>7f2' ))).toMatchObject({ dice: 20, count: 2, success: 7, fail: 2 });
    // expect( mapToWodRoll( parseWod( '2d20f2' ))).toMatchObject({ dice: 20, count: 2, fail: 2 });
    expect( mapToWodRoll( parseWod( 'd20!' ))).toMatchObject({ dice: 20, again: true });
    expect( mapToWodRoll( parseWod( 'd20!>7' ))).toMatchObject({ dice: 20, again: true, success: 7 });
    // expect( mapToWodRoll( parseWod( 'd20!f2' ))).toMatchObject({ dice: 20, again: true, fail: 2 });
    expect( mapToWodRoll( parseWod( 'd20>7f2' ))).toMatchObject({ dice: 20, success: 7, fail: 2 });
    expect( mapToWodRoll( parseWod( 'd20!>7f2' ))).toMatchObject({ dice: 20, again: true, success: 7, fail: 2 });
    expect( mapToWodRoll( parseWod( '2d20!>7f2' ))).toMatchObject({ dice: 20, count: 2, again: true, success: 7, fail: 2 });
  });
});
