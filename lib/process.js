'use strict';

const chalk = require('chalk');
const webpack = require('webpack');
const webpackDevServer = require('webpack-dev-server');
const settingFileProcess = require('./setting-file');

function tasks(mode) {
  if (mode === 'init') {
    settingFileProcess.createSweetPackFile();
    return;
  }

  const config = settingFileProcess.tasks();

  console.log(mode);
  console.log(config);

  if (mode === 'watch') {
    console.log(config);

    // [TODO] https://webpack.github.io/docs/webpack-dev-server.html
    const compiler = webpack(config);
    const server = new webpackDevServer(compiler);
    server.listen(8080);
  }

  else if (mode === 'build') {
    webpack(config, (err) => {
      if (err) {
        console.log(chalk.red(err));
      }

      console.log(chalk.cyan('start to build'));
    });
  }
}

module.exports = tasks;