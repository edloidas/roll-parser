import { parseWod } from '../../src/parser';
import Type from '../../src/object/Type';
import { testParse } from '../util';

testParse(
  parseWod,
  'Parse `WoD` notation:',
  [ 'd10', 'd10!', '1d10!', 'd10>8', 'd10>8f1', 'd10!>8f1', '1d10>8f1', '1d10!>8f1' ],
  [ '10', '2d10+1' ],
  Type.wod,
);
