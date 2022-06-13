module.exports = {
    entry: './src/js/main.js',

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
          test: /\.(png|jpe?g|gif|mp4|ogg|webm)$/i,
          use: [
            {
              loader: 'file-loader',
            },
          ],
        },
      ],
    },
  };