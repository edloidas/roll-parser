import { parseSimple } from '../../src/parser';
import Type from '../../src/object/Type';
import { testParse } from '../util';

testParse(
  parseSimple,
  'Parse `simple` notation:',
  [ '0', '1 2', '1 2 3', '1 2 -3' ],
  [ '1 2 3 4', '1 2 3 4 5' ],
  Type.simple,
);
