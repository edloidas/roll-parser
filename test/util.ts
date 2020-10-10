import Roll from '../src/object/Roll';
import WodRoll from '../src/object/WodRoll';
import Result from '../src/object/Result';
import { simpleNotation, classicNotation, wodNotation, resultNotation } from '../src/stringifier';

export const validRoll = regexp => ( roll ) => {
  test( `Should parse '${ roll }' roll.`, () => {
    expect( regexp.test( roll )).toBeTruthy();
  });
};

export const invalidRoll = regexp => ( roll ) => {
  test( `Should not parse '${ roll }' roll.`, () => {
    expect( regexp.test( roll )).toBeFalsy();
  });
};

export function testRolls( regexp, desc, validRolls, invalidRolls ) {
  describe( desc, () => {
    const parseValid = validRoll( regexp );
    validRolls.forEach( parseValid );

    const parseInvalid = invalidRoll( regexp );
    invalidRolls.forEach( parseInvalid );
  });
}

const stringifyArgs = ( args: any[]) => args.map( v => String( v )).join( ', ' );

export function testSimpleNotation( notation, ...args ) {
  test( `Should generate '${ notation }' from parameters '${ stringifyArgs( args ) }'.`, () => {
    expect( simpleNotation( new Roll( ...args ))).toBe( notation );
  });
}

export function testClassicNotation( notation, ...args ) {
  test( `Should generate '${ notation }' from parameters '${ stringifyArgs( args ) }'.`, () => {
    expect( classicNotation( new Roll( ...args ))).toBe( notation );
  });
}

export function testWodNotation( notation, ...args ) {
  test( `Should generate '${ notation }' from parameters '${ stringifyArgs( args ) }'.`, () => {
    expect( wodNotation( new WodRoll( ...args ))).toBe( notation );
  });
}

export function testResultNotation( result: string, notation: string, value: number, rolls: number[]) {
  test( `Should generate '${ notation }' from parameters '${ stringifyArgs([ notation, value, rolls ]) }'.`, () => {
    expect( resultNotation( new Result( notation, value, rolls ))).toBe( result );
  });
}

const validRollParse = ( parser, type?: any ) => ( roll ) => {
  test( `Should parse '${ roll }' roll.`, () => {
    const result = parser( roll );
    expect( result ).toBeTruthy();
    if ( type ) {
      expect( result.type ).toBe( type );
    }
  });
};

const invalidRollParse = parser => ( roll ) => {
  test( `Should not parse '${ roll }' roll.`, () => {
    expect( parser( roll )).toBeFalsy();
  });
};

export function testParse( parser, desc, validRolls, invalidRolls, type?: any ) {
  describe( desc, () => {
    const parseValid = validRollParse( parser, type );
    validRolls.forEach( parseValid );

    const parseInvalid = invalidRollParse( parser );
    invalidRolls.forEach( parseInvalid );
  });
}
