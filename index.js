const parseSimple = require( './src/simple' );
const parseClassic = require( './src/classic' );

function parse( roll ) {
  return parseSimple( roll ) || parseClassic( roll ) || null;
}

module.exports = {
  parse,
  parseSimple,
  parseClassic,
};
