const path = require( 'path' );
const NoEmitOnErrorsPlugin = require( 'webpack' ).NoEmitOnErrorsPlugin;

module.exports = {
  entry: './index.js',
  output: {
    path: path.resolve( __dirname, 'dist' ),
    publicPath: '',
    filename: 'roll-parser.js',
  },
  plugins: [
    new NoEmitOnErrorsPlugin(),
  ],
  target: 'web',
  devtool: 'source-map',
};
