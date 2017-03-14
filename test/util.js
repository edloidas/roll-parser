module.exports = {
  validRoll: regexp => ( roll ) => {
    test( `Should parse '${ roll }' roll.`, () => {
      expect( regexp.test( roll )).toBeTruthy();
    });
  },
  invalidRoll: regexp => ( roll ) => {
    test( `Should not parse '${ roll }' roll.`, () => {
      expect( regexp.test( roll )).toBeFalsy();
    });
  },
};
