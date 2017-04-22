roll-parser
===========

[![Travis Build Status][travis-image]][travis-url]
[![AppVeyor Build Status][appveyor-image]][appveyor-url]
[![Coverage Status][coveralls-image]][coveralls-url]
[![Dependency Status][dep-image]][dep-url]
[![devDependency Status][devdep-image]][devdep-url]

> Parser for classic (2d6+1) and simplified (2 6 1) dice rolls.

## Install

```
npm install --save roll-parser
```

## Usage

```js
const { Roll, parse } = require( 'roll-parser' );

// { dice: 10, count: 2, modifier: -2, bottom: 2, top: 9 }
const simpleResult = parse( '2 10 -2 2 9' );

// { dice: 6, count: 4, modifier: 1, bottom: 0, top: 5 }
const classicResult = parse( '4d6+1 (,5)' );

// `d20`
const basicRoll = new Roll( 20 );
// `2d10-4` within interval of [3, 17] for each dice
const complexRoll = new Roll( 10, 2, -4, 3, 17 );

// '20'
const basicRollNotation = basicRoll.toSimpleNotation();
// '2d10-4 (3,17)'
const complexRollNotation = complexRoll.toClassicNotation();

```

## Documentation

### parse( roll )

Parses both simplified and classic roll.
Will try to parse the roll as simplified at first and then fallback to classic one in the case of failure. Returns a `Roll` object or `null` if parsing failed.

### parseSimpleRoll( roll )

Parses simplified roll, like `'2 10 -1'`. Returns a `Roll` object or `null` if parsing failed.


### parseClassicRoll( roll )

Parses classic roll, like `'2d10-1'`. Returns a `Roll` object or `null` if parsing failed.


#### roll

Type: `string`

Simplified or classic roll notation.

### Roll( dice, count, modifier, bottom, top  )

Constructor for dice roll.

##### dice

Type: `number`<br>
Default: `20`

Dice type (maximum rolled number possible).

##### count

Type: `number`<br>
Default: `1`

Number of dices to roll.

##### modifier

Type: `number`<br>
Default: `0`

Roll modifier, that will be added or subtracted from roll.

##### bottom

Type: `number`

Bottom roll limit.

##### top

Type: `number`

Top roll limit.

### Roll.prototype.toSimpleNotation()

Returns a `string` representation of roll in simple notation.

### Roll.prototype.toClassicNotation()

Returns a `string` representation of roll in classic notation.

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
