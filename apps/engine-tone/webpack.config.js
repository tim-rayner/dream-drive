const { join } = require('path');

module.exports = {
  target: 'node',
  mode: process.env.NODE_ENV === 'production' ? 'production' : 'development',
  entry: join(__dirname, 'src/main.ts'),
  output: {
    path: join(__dirname, '../../dist/apps/engine-tone'),
    filename: 'main.js',
  },
  resolve: {
    extensions: ['.ts', '.js'],
  },
  module: {
    rules: [
      {
        test: /\.ts$/,
        use: 'ts-loader',
        exclude: /node_modules/,
      },
    ],
  },
  externals: {
    // Don't bundle node_modules for Node.js apps
  },
};
