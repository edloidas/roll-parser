#!/usr/bin/env node

process.title = 'roll-parser';

const path = require( 'path' );
const fs = require( 'fs' );
const minimist = require( 'minimist' );

const { parseAndRoll } = require( '../index' );

const argv = minimist( process.argv.slice( 2 ));

const format = roll => `${ parseAndRoll( roll ) || 'Invalid roll notation.' }`;

void function cmd() {
  // --help
  if ( argv.help ) {
    fs.createReadStream( path.resolve( __dirname, './help.txt' )).pipe( process.stdout );
  } else {
    const rolls = argv._.length > 0 ? argv._ : [ 'd20' ];
    rolls.forEach( roll => console.log( format( roll )));
  }
}();
