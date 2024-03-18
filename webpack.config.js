const path = require('path')
const { IgnorePlugin } = require('webpack')

/**
 * Lambda Functions
 */
const entryPoints = {
  'http-create': './src/controllers/http/create.ts',
  'http-update': './src/controllers/http/update.ts',
  'http-list': './src/controllers/http/list.ts',
}

/**
 * Webpack config
 */
module.exports = {
  mode: 'production',
  target: 'node18',
  entry: entryPoints,
  // devtool: 'source-map',

  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: 'ts-loader',
        exclude: /node_modules/,
      },
    ]
  },

  resolve: {
    extensions: ['.tsx', '.ts', '.js']
  },

  output: {
    path: path.join(__dirname, 'dist'),
    library: {
      type: 'commonjs-module'
    }
  },

  optimization: {
    minimize: true
  },

  plugins: [
    // https://github.com/aws/aws-sdk-js-v3/issues/5301
    new IgnorePlugin({ resourceRegExp: /^aws-crt$/ })
  ]
}
