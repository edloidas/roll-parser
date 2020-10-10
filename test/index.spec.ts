import * as rollParser from '../index';

describe( 'Roll Parser:', () => {
  for ( const fun in rollParser ) {
    if ( Object.prototype.hasOwnProperty.call( rollParser, fun )) {
      test( `Should not have 'undefined' export '${ fun }'`, () => {
        expect( rollParser[ fun ]).toBeDefined();
      });
    }
  }
});
