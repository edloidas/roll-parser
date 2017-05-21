// random :: Number -> Number -> Number
//   Generates random integer from the range of [ min, max ] values
const random = min => max => Math.floor( Math.random() * (( max + 1 ) - min )) + min;

// randomRoll :: Number -> Number
//   Generates roll from 1 to `max` value
const randomRoll = random( 1 );

module.exports = {
  random,
  randomRoll,
};
