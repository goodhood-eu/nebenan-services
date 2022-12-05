const register = require('@babel/register').default;

register({ extensions: ['.ts', '.tsx', '.js', '.jsx'] });

module.exports = {
  globals: 'document,addEventListener,removeEventListener',
  'check-leaks': true,
  recursive: true,
  ui: 'bdd',
  reporter: 'nyan',
  timeout: 2000,
  exclude: [
    'node_modules/**',
  ],
  extension: ['ts'],
  spec: '**/*.test.ts',
};
