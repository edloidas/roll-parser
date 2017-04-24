const { parseSimple, parseClassic } = require( '../src/parser' );
const map = require( '../src/mapper' );

describe( 'Map parser result:', () => {
  test( 'Should map falsy values to `null`.', () => {
    expect( map( null )).toBeNull();
  });

  test( 'Should set dice for single value roll.', () => {
    expect( map( parseSimple( '10' ))).toMatchObject({ dice: 10 });
  });

  test( 'Should map dice to second value and count to first value.', () => {
    expect( map( parseSimple( '2 10' ))).toMatchObject({ dice: 10, count: 2 });
  });

  test( 'Should correctly map from 3 to 5 values', () => {
    expect( map( parseSimple( '2 10 -2' ))).toMatchObject({ dice: 10, count: 2, modifier: -2 });
    expect( map( parseSimple( '2 10 +2 2' ))).toMatchObject({ dice: 10, count: 2, modifier: 2, bottom: 2 });
    expect( map( parseSimple( '2 10 2 2 17' ))).toEqual({ dice: 10, count: 2, modifier: 2, bottom: 2, top: 17 });
    expect( map( parseClassic( 'd10' ))).toMatchObject({ dice: 10, count: 1, modifier: 0 });
    expect( map( parseClassic( 'd10+3' ))).toMatchObject({ dice: 10, count: 1, modifier: 3 });
    expect( map( parseClassic( 'd10-1 (,17)' ))).toEqual({ dice: 10, count: 1, modifier: -1, bottom: 0, top: 17 });
    expect( map( parseClassic( '2d10-2 (,17)' ))).toEqual({ dice: 10, count: 2, modifier: -2, bottom: 0, top: 17 });
  });

  test( 'Should trim excess values', () => {
    const result = { dice: 10, count: 2, modifier: -2, bottom: 2, top: 17 };
    expect( map([ 'skipped', '2', '10', '-2', '2', '17', '9' ])).toEqual( result );
  });
});
