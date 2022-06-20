const { merge } = require('webpack-merge');
const common = require('./webpack.common.js');
const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = merge(common, {
    mode: 'development',
    devtool: 'inline-source-map',

    output: {
        filename: '[name].bundle.js',
        path: path.resolve(__dirname, 'site/'),
    },
  
    plugins: [
        new HtmlWebpackPlugin({
            filename: 'index.html',
            template: './src/template/index.html'
        })
    ],

    devServer: {
        static: './site',
    },
});