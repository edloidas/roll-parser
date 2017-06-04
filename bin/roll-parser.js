#!/usr/bin/env node

process.title = 'roll-parser';

/* eslint-disable max-len, no-console, no-var, vars-on-top, prefer-spread, global-require, import/no-dynamic-require, wrap-iife, no-void */

const argv = require( 'minimist' )( process.argv.slice( 2 ));
const path = require( 'path' );
const fs = require( 'fs' );

const rollParser = require( '../index' );

void function cmd() {
  // --help
  if ( argv.help ) {
    fs.createReadStream( path.resolve( __dirname, './help.txt' )).pipe( process.stdout );
  } else {
    const rolls = argv._.length > 0 ? argv._ : [ 'd20' ];
    rolls.forEach( roll => console.log( rollParser.parseAndRoll( roll ).toString()));
  }
}();
