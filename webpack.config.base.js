'use strict';

module.exports = {

  output: {
    library: 'salvager',
    libraryTarget: 'umd'
  },

  module: {
    loaders: [{
      test: /\.js$/,
      loader: 'babel',
      exclude: /node_modules/
    }]
  },

  resolve: {
    extensions: ['', '.js']
  }

};
