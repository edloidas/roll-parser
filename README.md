<h1 align="center">Roll Parser</h1>

<p align="center">
Parser for classic (2d6+1), simple (2 6 1), and WoD (4d10!>6f1) dice rolls.
</p>

[![Travis Build Status][travis-image]][travis-url]
[![AppVeyor Build Status][appveyor-image]][appveyor-url]
[![Coverage Status][coveralls-image]][coveralls-url]
[![devDependency Status][devdep-image]][devdep-url]
<!-- [![Dependency Status][dep-image]][dep-url] -->

[![Node.js version][node-image]][node-url]
[![Project is on npm][npm-image]][npm-url]

## Documentation

Please review the [API documentation](http://edloidas.com/roll-parser/).

## Install

To use with node:
```
npm install roll-parser
```

Then in the console:
```js
const rollParser = require('roll-parser');
```

<br/>
To use directly in the browser:
```html
<script src="https://unpkg.com/roll-parser/dist/roll-parser.min.js"></script>
```
Full version:
```html
<script src="https://unpkg.com/roll-parser/dist/roll-parser.js"></script>
```

Then access all functions from `rollParser` object.

## Usage

```js
const { parse, roll, parseAndRoll, Roll } = require('roll-parser');

// `parse()` function parses any notation and returns `Roll` or `WodRoll` object
//=> { dice: 6, count: 4, modifier: 1 }
const parsedRoll = parse('4d6+1');

// `Roll` or `WodRoll` can be stringified
//=> '4d6+1'
const rollNotation = parsedRoll.toString();

//=> { notation: '4d6+1', value: 16, rolls: [3, 1, 6, 5] }
const result1 = roll(parsedRoll);
//=> { notation: '2d20-3', value: 23, rolls: [11, 15] }
const result2 = roll(new Roll(20, 2, -3));
// Can also accept plain objects
//=> { notation: '2d10>7', value: 1, rolls: [4, 8] }
const result3 = roll({dice: 10, count: 2, success: 7});

// `parseAndRoll()` function can parse any notation and then roll the dice
// Any invalid arguments, except `null` or `undefined`, will be parsed as default `Roll`
//=> { notation: '3d10!>8f1', value: 2, rolls: [3, 10, 7, 9] }
const result4 = parseAndRoll('3d10!>8f1');

//=> '(3d10!>8f1) 2 [3,10,7,9]'
const resultNotation = result4.toString();
```

Specific parsers can be used.

__Classic (D&D):__

```js
const {
  parseClassicRoll,
  rollClassic,
  parseAndRollClassic,
  Roll
} = require('roll-parser');

//=> { dice: 10, count: 1, modifier: 0 }
const parsedRoll = parseClassicRoll('d10');

//=> { notation: 'd10', value: 7, rolls: [7] }
const result1 = rollClassic(parsedRoll);

//=> { notation: '2d20', value: 26, rolls: [11, 15] }
const result2 = rollClassic(new Roll(20, 2));

//=> { notation: '4d10+1', value: 22, rolls: [4, 6, 2, 9] }
const result3 = rollClassic({ dice: 10, count: 4, modifier: 1 });

//=> { notation: '3d6', value: 15, rolls: [6, 6, 3] }
const result4 = parseAndRollClassic('3d6');
```

__WoD (World of Darkness):__

```js
const {
  parseWodRoll,
  rollWod,
  parseAndRollWod,
  WodRoll
} = require('roll-parser');

//=> { dice: 10, count: 1, again: false, success: 6, fail: 0 }
const parsedRoll = parseWodRoll('d10>6');

// Returns notation, number of success rolls and list of all dice rolls
//=> { notation: 'd10', value: 1, rolls: [7] }
const result1 = rollWod(parsedRoll);

//=> { notation: '4d10>6f1', value: 1, rolls: [4, 10, 5, 2] }
const result2 = rollWod(new WodRoll(10, 4, false, 6, 1));

//=> { notation: '4d10!>8f1', value: 22, rolls: [1, 8, 5, 10, 10, 4] }
const result3 = rollWod({ dice: 10, count: 2, again: true, success: 8, fail: 1 });

//=> { notation: '4d10>7f4', value: 1, rolls: [6, 3, 8, 4] }
const result4 = parseAndRollWod('4d10>7f4');
```

__Simple (D&D, space-separated):__

```js
const { parseSimpleRoll, parseAndRollSimple } = require('roll-parser');

//=> { dice: 10, count: 1, modifier: 0 }
const parsedRoll = parseSimpleRoll('10');

//=> { notation: '4d10-1', value: 23, rolls: [3, 6, 8, 7] }
const result = parseAndRollSimple('4 10 -1');
```

Random number generator can be used to roll the dice.

```js
const { random } = require('roll-parser');

//=> 84 - d100-like roll
random(100);

//=> 7 - d10-like roll
random(10);

//=> [2, 5, 2, 6] - 4d6-like roll
[...Array(4)].map(() => random(6));
```

Even so the parse&roll functions uses checks to convert non-standard objects to `Roll` or `WodRoll`, explicit conversion can be used in some cases:

```js
const { convert } = require('roll-parser');

//=> new Roll(undefined, 4, -3)
convert({ count: 4, modifier: -3 });

//=> new WodRoll(10, 6, true, undefined, 2)
convert({ dice: 10, count: 6, again: true, fail: 2 });
```

## Releases

Please review the [changelog](https://github.com/edloidas/roll-parser/releases).

## Contributing

♥ [roll-parser](https://github.com/edloidas/roll-parser) and want to get involved?<br>
Please, check the [guide](CONTRIBUTING.md) first.

## License

[MIT](LICENSE) © [Mikita Taukachou](https://edloidas.com)

<!-- Links -->
[travis-url]: https://travis-ci.org/edloidas/roll-parser
[travis-image]: https://img.shields.io/travis/edloidas/roll-parser.svg?label=linux%20build

[appveyor-url]: https://ci.appveyor.com/project/edloidas/roll-parser
[appveyor-image]: https://img.shields.io/appveyor/ci/edloidas/roll-parser.svg?label=windows%20build

[coveralls-url]: https://coveralls.io/github/edloidas/roll-parser?branch=master
[coveralls-image]: https://coveralls.io/repos/github/edloidas/roll-parser/badge.svg?branch=master

[dep-url]: https://david-dm.org/edloidas/roll-parser
[dep-image]: https://david-dm.org/edloidas/roll-parser.svg

[devdep-url]: https://david-dm.org/edloidas/roll-parser#info=devDependencies
[devdep-image]: https://david-dm.org/edloidas/roll-parser/dev-status.svg

[node-url]: https://nodejs.org
[node-image]: https://img.shields.io/badge/node-≥%206.0.0-green.svg

[npm-url]: https://www.npmjs.com/package/roll-parser
[npm-image]: https://img.shields.io/badge/npm-roll--parser-blue.svg
