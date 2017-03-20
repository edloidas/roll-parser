const grammar = require( './grammar' ).simple;

module.exports = function parse( roll ) {
  let result = null;

  for ( let i = 0; i < grammar.length; i++ ) {
    result = grammar[ i ].exec( roll );

    if ( result ) {
      break;
    }
  }

  return result;
};
