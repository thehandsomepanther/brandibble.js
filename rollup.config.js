import resolve from 'rollup-plugin-node-resolve';
import pkg from './package.json';

export default {
  input: 'src/brandibble.js',
  external: [
    'circular-json',
    'es6-promise',
    'localforage',
    'lodash.compact',
    'lodash.every',
    'lodash.filter',
    'lodash.find',
    'lodash.includes',
    'lodash.map',
    'lodash.reduce',
    'lodash.reject',
    'lodash.reverse',
    'lodash.sortby',
    'moment',
    'moment-timezone',
    'validate.js',
  ],
  output: {
    file: pkg.main,
    format: 'cjs',
  },
  plugins: [
    resolve({
      module: true,
      main: true,
    }),
  ],
};
