// random :: Number -> Number -> Number
//   Generates random integer from the range of [ min, max ] values
const random = min => max => Math.floor( Math.random() * (( max + 1 ) - min )) + min;

/**
 * Generates random positive integer from `1` to `max`.
 *
 * @func
 * @alias random
 * @since v2.0.0
 * @param {Number} max - maximum possible generated value
 * @return {Number} Positive integer, from `1` to `max`
 * @example
 * random(100); //=> 77 - random number from 1 to 100
 * random(1);   //=>  1 - always rolls 1
 */
const randomRoll = random( 1 );

module.exports = {
  random,
  randomRoll,
};
