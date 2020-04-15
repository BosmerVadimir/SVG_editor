let webpack = require('webpack');
let WebpackDevServer = require('webpack-dev-server');
let config = require('./webpack.config');

new WebpackDevServer(webpack(config), {
  publicPath: config.output.publicPath,
  hot: true
}).listen(3000, '127.0.0.1', function (err) {
  if (err) {
    console.log(err);
  }
  console.log('Listening at localhost:3000');
});
