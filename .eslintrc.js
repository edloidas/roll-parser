module.exports = {
  'extends': [
    'eslint:recommended',
    'plugin:@typescript-eslint/eslint-recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:@typescript-eslint/recommended-requiring-type-checking',
  ],
  'parser': '@typescript-eslint/parser',
  'parserOptions': {
    'ecmaVersion': 2019,
    'project': 'tsconfig.json',
    'tsconfigRootDir': '.',
  },
  'rules': {
    'block-spacing': [ 2, 'always' ],
    'space-before-function-paren': [ 2, { 'anonymous': 'always', 'named': 'never' } ],
    'space-in-parens': [ 2, 'always', { 'exceptions': [ '{}', '[]', '()' ] } ],
    'spaced-comment': [ 2, 'always', { 'exceptions': [ '-', '+' ] } ],
    'arrow-spacing': [ 2, { 'before': true, 'after': true } ],
    'array-bracket-spacing': [ 2, 'always' ],
    'computed-property-spacing': [ 2, 'always' ],
    'template-curly-spacing': [ 2, 'always' ],
    'no-restricted-syntax': [ 'off' ],
    'object-property-newline': [ 'off', { 'allowMultiplePropertiesPerLine': true } ],
    'no-plusplus': [ 'error', { 'allowForLoopAfterthoughts': true } ],
    'no-underscore-dangle': [ 'off' ],
  },
  'env': {
    'browser': true,
    'es6': true,
    'node': true,
    'jest': true,
  }
}
