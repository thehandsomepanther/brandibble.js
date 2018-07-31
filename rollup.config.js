import resolve from 'rollup-plugin-node-resolve';
import babel from 'rollup-plugin-babel';
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
    babel({
      babelrc: false,
      presets: [['env', { modules: false }]],
      plugins: ['transform-class-properties', 'transform-object-rest-spread', 'external-helpers'],
      exclude: 'node_modules/**',
    }),
  ],
};
