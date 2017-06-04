#!/usr/bin/env bash
set -e

DIST="./dist/roll-parser.min.js"

HEADER=$(./build/header.sh)
BODY=$(./build/body.sh)
JS=$(<$DIST)

FILE="$HEADER\n$BODY$JS"

echo -e "$FILE" > $DIST
