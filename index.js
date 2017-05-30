/* eslint global-require: "off" */
module.exports = {
  Roll: require( './src/object/Roll' ),
  WodRoll: require( './src/object/WodRoll' ),
  Result: require( './src/object/Result' ),

  parse: require( './src/complex/parse' ),
  parseClassicRoll: require( './src/complex/parseClassicRoll' ),
  parseSimpleRoll: require( './src/complex/parseSimpleRoll' ),
  parseWodRoll: require( './src/complex/parseWodRoll' ),

  roll: require( './src/roller' ).rollAny,
  rollClassic: require( './src/roller' ).rollClassic,
  rollWod: require( './src/roller' ).rollWod,

  parseAndRoll: require( './src/complex/parseAndRoll' ),
  parseAndRollSimple: require( './src/complex/parseAndRollSimple' ),
  parseAndRollClassic: require( './src/complex/parseAndRollClassic' ),
  parseAndRollWod: require( './src/complex/parseAndRollWod' ),

  ramdom: require( './src/random' ).randomRoll,
};
