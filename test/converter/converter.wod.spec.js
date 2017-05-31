const { convertToWodRoll } = require( '../../src/converter' );
const WodRoll = require( '../../src/object/WodRoll' );

describe( 'Convert anything to `WodRoll`:', () => {
  test( 'Should convert WodRoll-like objects', () => {
    expect( convertToWodRoll({})).toBeInstanceOf( WodRoll );
    expect( convertToWodRoll({})).toEqual( new WodRoll());
    expect( convertToWodRoll({ dice: 6 })).toEqual( new WodRoll( 6 ));
    expect( convertToWodRoll({ count: 2 })).toEqual( new WodRoll( undefined, 2 ));
    expect( convertToWodRoll({ again: true })).toEqual( new WodRoll( undefined, undefined, true ));
    expect( convertToWodRoll({ success: 7 })).toEqual(
      new WodRoll( undefined, undefined, undefined, 7 ),
    );
    expect( convertToWodRoll({ fail: 2 })).toEqual(
      new WodRoll( undefined, undefined, undefined, undefined, 2 ),
    );
    expect( convertToWodRoll({ dice: 6, count: 2, again: true, success: 7, fail: 2 })).toEqual(
      new WodRoll( 6, 2, true, 7, 2 ),
    );
    expect( convertToWodRoll( new WodRoll( 6, 2, true, 7, 2 ))).toEqual(
      new WodRoll( 6, 2, true, 7, 2 ),
    );
  });

  test( 'Should convert mixed objects', () => {
    expect( convertToWodRoll({ dice: 6, a: '2' })).toBeInstanceOf( WodRoll );
    expect( convertToWodRoll({ dice: 6, a: '2' })).toEqual( new WodRoll( 6 ));
    expect( convertToWodRoll({ count: 2, dice: 'q' })).toEqual( new WodRoll( 'q', 2 ));
  });

  test( 'Should convert invalid arguments to default `WodRoll`', () => {
    expect( convertToWodRoll({ a: '2', b: 2 })).toBeInstanceOf( WodRoll );
    expect( convertToWodRoll({ a: '2', b: 2 })).toEqual( new WodRoll());
    expect( convertToWodRoll( null )).toEqual( new WodRoll());
    expect( convertToWodRoll( undefined )).toEqual( new WodRoll());
    expect( convertToWodRoll([])).toEqual( new WodRoll());
    expect( convertToWodRoll( '' )).toEqual( new WodRoll());
    expect( convertToWodRoll( '4d10!>6f1' )).toEqual( new WodRoll());
  });
});
