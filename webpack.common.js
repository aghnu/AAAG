const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
    entry: './src/js/main.js',
    output: {
      filename: '[name].bundle.js',
      path: path.resolve(__dirname, 'site/assets/'),
    },

    plugins: [
      new HtmlWebpackPlugin({
        title: "Aghnu's ASCII Art Generator",
        filename: '../index.html'
      })
    ],

    resolve: {
      fallback: {
        fs: false,
        path: false,
        crypto: false
      }
    },

    module: {
      rules: [
        {
          test: /\.s[ac]ss$/i,
          use: [
            "style-loader",
            "css-loader",
            "sass-loader",
          ],
        },
        {
          test: /\.(png|jpe?g|gif)$/i,
          use: [
            {
              loader: 'file-loader',
            },
          ],
        },
      ],
    },
  };