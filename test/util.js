const Roll = require( '../src/object/Roll' );
const WodRoll = require( '../src/object/WodRoll' );
const { simpleNotation, classicNotation, wodNotation } = require( '../src/stringifier' );

const validRoll = regexp => ( roll ) => {
  test( `Should parse '${ roll }' roll.`, () => {
    expect( regexp.test( roll )).toBeTruthy();
  });
};

const invalidRoll = regexp => ( roll ) => {
  test( `Should not parse '${ roll }' roll.`, () => {
    expect( regexp.test( roll )).toBeFalsy();
  });
};

function testRolls( regexp, desc, validRolls, invalidRolls ) {
  describe( desc, () => {
    const parseValid = validRoll( regexp );
    validRolls.forEach( parseValid );

    const parseInvalid = invalidRoll( regexp );
    invalidRolls.forEach( parseInvalid );
  });
}

const stringifyArgs = args => args.map( v => String( v )).join( ', ' );

function testSimpleNotation( notation, ...args ) {
  test( `Should generate '${ notation }' from parameters '${ stringifyArgs( args ) }'.`, () => {
    expect( simpleNotation( new Roll( ...args ))).toBe( notation );
  });
}

function testClassicNotation( notation, ...args ) {
  test( `Should generate '${ notation }' from parameters '${ stringifyArgs( args ) }'.`, () => {
    expect( classicNotation( new Roll( ...args ))).toBe( notation );
  });
}

function testWodNotation( notation, ...args ) {
  test( `Should generate '${ notation }' from parameters '${ stringifyArgs( args ) }'.`, () => {
    expect( wodNotation( new WodRoll( ...args ))).toBe( notation );
  });
}

const validRollParse = parser => ( roll ) => {
  test( `Should parse '${ roll }' roll.`, () => {
    expect( parser( roll )).toBeTruthy();
  });
};

const invalidRollParse = parser => ( roll ) => {
  test( `Should not parse '${ roll }' roll.`, () => {
    expect( parser( roll )).toBeFalsy();
  });
};

function testParse( parser, desc, validRolls, invalidRolls ) {
  describe( desc, () => {
    const parseValid = validRollParse( parser );
    validRolls.forEach( parseValid );

    const parseInvalid = invalidRollParse( parser );
    invalidRolls.forEach( parseInvalid );
  });
}

module.exports = {
  validRoll,
  invalidRoll,
  testRolls,
  testSimpleNotation,
  testClassicNotation,
  testWodNotation,
  validRollParse,
  invalidRollParse,
  testParse,
};
