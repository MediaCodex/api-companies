const path = require('path')

/**
 * Output directory
 */
const buildDir = path.join(__dirname, 'build')

/**
 * Lambda Functions
 */
const entryPoints = {
  'http-create': './src/controllers/http/create.js',
  'http-update': './src/controllers/http/update.js',
  'http-index': './src/controllers/http/index.js',
  'http-show': './src/controllers/http/show.js'
}

/**
 * Webpack config
 */
module.exports = {
  mode: 'production',
  target: 'node',
  entry: entryPoints,
  devtool: "inline-source-map",

  module: {
    rules: [
      {
        test: /\.([cm]?ts|tsx)$/,
        exclude: /node_modules/,
        use: 'ts-loader'
      }
    ]
  },

  output: {
    libraryTarget: 'commonjs2',
    path: buildDir
  },

  optimization: {
    minimize: false
  }
}
