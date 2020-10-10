import { parseClassic } from '../../src/parser';
import Type from '../../src/object/Type';
import { testParse } from '../util';

testParse(
  parseClassic,
  'Parse `classic` notation:',
  [ 'd6', '2d10', '1D20-3' ],
  [ '0 d1' ],
  Type.classic,
);
