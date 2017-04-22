const Roll = require( '../src/roll' );

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

function classicNotation( notation, ...args ) {
  test( `Should generate '${ notation }' from parameters '${ stringifyArgs( args ) }'.`, () => {
    expect( new Roll( ...args ).toClassicNotation()).toBe( notation );
  });
}

function simpleNotation( notation, ...args ) {
  test( `Should generate '${ notation }' from parameters '${ stringifyArgs( args ) }'.`, () => {
    expect( new Roll( ...args ).toSimpleNotation()).toBe( notation );
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
  classicNotation,
  simpleNotation,
  validRollParse,
  invalidRollParse,
  testParse,
};
