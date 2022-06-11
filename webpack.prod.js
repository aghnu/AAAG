const { merge } = require('webpack-merge');
const common = require('./webpack.common.js');
const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = merge(common, {
    mode: 'production',
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
});