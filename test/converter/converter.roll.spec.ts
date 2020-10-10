import { convertToRoll } from '../../src/converter';
import Roll from '../../src/object/Roll';

describe( 'Convert anything to `Roll`:', () => {
  test( 'Should convert Roll-like objects', () => {
    expect( convertToRoll({})).toBeInstanceOf( Roll );
    expect( convertToRoll({})).toEqual( new Roll());
    expect( convertToRoll({ dice: 6 })).toEqual( new Roll( 6 ));
    expect( convertToRoll({ count: 2 })).toEqual( new Roll( undefined, 2 ));
    expect( convertToRoll({ modifier: -1 })).toEqual( new Roll( undefined, undefined, -1 ));
    expect( convertToRoll({ dice: 6, count: 2 })).toEqual( new Roll( 6, 2 ));
    expect( convertToRoll({ dice: 6, modifier: -1 })).toEqual( new Roll( 6, undefined, -1 ));
    expect( convertToRoll({ count: 2, modifier: -1 })).toEqual( new Roll( undefined, 2, -1 ));
    expect( convertToRoll({ dice: 6, count: 2, modifier: -1 })).toEqual( new Roll( 6, 2, -1 ));
    expect( convertToRoll( new Roll( 6, 2, -1 ))).toEqual( new Roll( 6, 2, -1 ));
  });

  test( 'Should convert mixed objects', () => {
    expect( convertToRoll({ dice: 6, a: '2' })).toBeInstanceOf( Roll );
    expect( convertToRoll({ dice: 6, a: '2' })).toEqual( new Roll( 6 ));
    // expect( convertToRoll({ count: 2, dice: 'q' })).toEqual( new Roll( 'q', 2 ));
  });

  test( 'Should convert invalid arguments to default `Roll`', () => {
    expect( convertToRoll({ a: '2', b: 2 })).toBeInstanceOf( Roll );
    expect( convertToRoll({ a: '2', b: 2 })).toEqual( new Roll());
    expect( convertToRoll( null )).toEqual( new Roll());
    expect( convertToRoll( undefined )).toEqual( new Roll());
    expect( convertToRoll([])).toEqual( new Roll());
    expect( convertToRoll( '' )).toEqual( new Roll());
    expect( convertToRoll( '2d6+1' )).toEqual( new Roll());
  });
});
