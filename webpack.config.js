const ExtractTextPlugin = require("extract-text-webpack-plugin");
const path = require("path");

const webpack = require("webpack");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const Clean = require("clean-webpack-plugin");

module.exports = {
  entry: {
    where: "./src/entry.js",
    broken: "./src/entry-broken.js"
  },
  resolve: {
    modulesDirectories: ["node_modules", "src"]
  },
  output: {
    path: path.resolve(__dirname, "dist"),
    filename: "[name].js"
  },
  module: {
    preLoaders: [
      {test: /\.js$/, loader: "eslint-loader", exclude: /node_modules/}
    ],
    loaders: [
      //// Extract css files
      {
        test: /\.css$/,
        loader: ExtractTextPlugin.extract("style-loader", "css-loader")
      },
      {
        test: /\.less$/,
        loader: ExtractTextPlugin.extract("style-loader", "css-loader!less-loader")
      },

      // Needed for the css-loader when [bootstrap-webpack](https://github.com/bline/bootstrap-webpack)
      // loads bootstrap's css.
      { test: /\.(woff|woff2)(\?v=\d+\.\d+\.\d+)?$/,   loader: "url?limit=10000&mimetype=application/font-woff&name=fonts/[name].[ext]" },
      { test: /\.ttf(\?v=\d+\.\d+\.\d+)?$/,    loader: "file?name=fonts/[name].[ext]" },
      { test: /\.eot(\?v=\d+\.\d+\.\d+)?$/,    loader: "file?name=fonts/[name].[ext]" },
      { test: /\.svg(\?v=\d+\.\d+\.\d+)?$/,    loader: "file?name=fonts/[name].[ext]" },
      { test: /\.js$/, exclude: /node_modules/, loader: "babel-loader"}
    ]
  },
  //// Use the plugin to specify the resulting filename (and add needed behavior to the compiler)
  plugins: [
    new ExtractTextPlugin("[name].css"),
    new webpack.optimize.CommonsChunkPlugin("commons", "commons.js"),
    new HtmlWebpackPlugin({
      template: "src/index.html", // Load a custom template
      inject: "body", // Inject all scripts into the body
      chunks: ["commons", "where"]
    }),
    new HtmlWebpackPlugin({
      filename: "broken.html",
      template: "src/broken.html", // Load a custom template
      inject: "body", // Inject all scripts into the body
      chunks: ["commons", "broken"]
    }),
    new Clean(["dist"])
  ]
};

if (process.env.MOCK_COMMITS) {
  module.exports.resolve.modulesDirectories.push("test");
  module.exports.resolve.alias["where/changes/changes"] = "mock-changes";
  module.exports.resolve.alias["where/changes/changesUpdater"] = "mock-changesUpdater";
}