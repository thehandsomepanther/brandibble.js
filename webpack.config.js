const webpack = require('webpack');
const path = require('path');

module.exports = {
  entry: [
    'whatwg-fetch',
    './lib/brandibble'
  ],
  output: {
    path: __dirname + '/dist',
    filename: "brandibble.js",
    libraryTarget: 'umd'
  },
  resolve: {
    root: path.resolve(__dirname),
    extensions: ['', '.js'],
    alias: { brandibble: 'lib' }
  },
  module: {
    loaders: [
      {
        test: /\.js/,
        exclude: /node_modules/,
        loader: 'babel',
        query: {
          presets: ['es2015'],
          plugins: []
        }
      }
    ]
  },
  plugins: []
};
