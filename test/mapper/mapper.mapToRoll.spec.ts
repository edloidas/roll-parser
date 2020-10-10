import { parseSimple, parseClassic } from '../../src/parser';
import { mapToRoll } from '../../src/mapper';

describe( 'Map parser result to Roll:', () => {
  test( 'Should map falsy values to `null`', () => {
    expect( mapToRoll( null )).toBeNull();
  });

  test( 'Should set dice for single value roll', () => {
    expect( mapToRoll( parseSimple( '10' ))).toMatchObject({ dice: 10 });
    expect( mapToRoll( parseClassic( 'd10' ))).toMatchObject({ dice: 10 });
  });

  test( 'Should map dice to second value and count to first value', () => {
    expect( mapToRoll( parseSimple( '2 10' ))).toMatchObject({ dice: 10, count: 2 });
  });

  test( 'Should correctly map from 3 to 5 values', () => {
    expect( mapToRoll( parseSimple( '2 10 -2' ))).toEqual({ dice: 10, count: 2, modifier: -2 });
    expect( mapToRoll( parseSimple( '2 10 +2' ))).toEqual({ dice: 10, count: 2, modifier: 2 });
    expect( mapToRoll( parseSimple( '2 20 2' ))).toEqual({ dice: 20, count: 2, modifier: 2 });
    expect( mapToRoll( parseClassic( 'd10' ))).toEqual({ dice: 10, count: 1, modifier: 0 });
    expect( mapToRoll( parseClassic( 'd10+3' ))).toEqual({ dice: 10, count: 1, modifier: 3 });
    expect( mapToRoll( parseClassic( '2d10-2' ))).toEqual({ dice: 10, count: 2, modifier: -2 });
  });
});
