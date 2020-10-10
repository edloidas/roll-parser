import { convertToAnyRoll } from '../../src/converter';
import Roll from '../../src/object/Roll';
import WodRoll from '../../src/object/WodRoll';

describe( 'Convert anything to `Roll` or `WodRoll`:', () => {
  test( 'Should convert to `Roll`', () => {
    expect( convertToAnyRoll({})).toBeInstanceOf( Roll );
    expect( convertToAnyRoll({ dice: 6 })).toBeInstanceOf( Roll );
    expect( convertToAnyRoll({ count: 2 })).toBeInstanceOf( Roll );
    expect( convertToAnyRoll({ modifier: 3 })).toBeInstanceOf( Roll );
    expect( convertToAnyRoll({ dice: 6, count: 2, modifier: 3 })).toBeInstanceOf( Roll );
    expect( convertToAnyRoll( null )).toBeInstanceOf( Roll );
    expect( convertToAnyRoll( undefined )).toBeInstanceOf( Roll );
    expect( convertToAnyRoll([])).toBeInstanceOf( Roll );
    expect( convertToAnyRoll( '' )).toBeInstanceOf( Roll );
  });

  test( 'Should convert to `WodRoll`', () => {
    expect( convertToAnyRoll({ again: true })).toBeInstanceOf( WodRoll );
    expect( convertToAnyRoll({ success: 7 })).toBeInstanceOf( WodRoll );
    expect( convertToAnyRoll({ fail: 2 })).toBeInstanceOf( WodRoll );
    const wodRollObject = { dice: 6, count: 2, again: true, success: 7, fail: 2 };
    expect( convertToAnyRoll( wodRollObject )).toBeInstanceOf( WodRoll );
    expect( convertToAnyRoll({ modifier: 3, again: true })).toBeInstanceOf( WodRoll );
  });
});
