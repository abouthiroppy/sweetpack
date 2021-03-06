'use strict';

const chalk                 = require('chalk');
const sweetpackUtil         = require('./sweetpack/util');
const convertToSweetpack    = require('./sweetpack/convert');
const convertToWebpack      = require('./webpack/convert');
const createWebpackConfig   = require('./webpack/create-config');
const runServer             = require('./webpack/server');
const build                 = require('./webpack/build');
const { createTable }       = require('./display');
const { checkSettingFiles } = require('./validate');

const notFoundTemplate = (file) => chalk.red(`${file} was not found;(`);

function tasks(mode) {
  if (mode === 'init') {
    sweetpackUtil.createSweetPackFile();

    console.log(chalk.cyan('Has created .sweetpack.yml ;)'));
    return;
  }

  const config = sweetpackUtil.prepare();

  if (config == null) {
    console.log(notFoundTemplate('.sweetpack.yml'));
    process.exit(0);
  }

  const sweetpackConfig = convertToSweetpack(config);

  const errors = checkSettingFiles({
    flow   : !!sweetpackConfig.sweetpack.js.flow,
    postcss: !!sweetpackConfig.sweetpack.css.postcss
  });

  if (errors.length !== 0) {
    errors.forEach((file) => console.log(notFoundTemplate(file)));
    process.exit();
  }

  const webpackConfig = convertToWebpack(mode, sweetpackConfig);
  const res           = createWebpackConfig(webpackConfig, sweetpackConfig);

  if (mode === 'watch') {
    runServer(res, sweetpackConfig.sweetpack.dev.dashboard);
  }

  else if (mode === 'build') {
    console.log(chalk.cyan('Start building...'));

    build(res)
      .then((res) => {
        const {
          hash,
          assets,
          compiler
        } = res.compilation;

        const assetsData = Object.keys(assets).map((key) =>
          [chalk.yellow(key), `${assets[key].size()} KB`]
        );

        const table = createTable([
          ['', ''],
          ['hash', hash],
          ['output', compiler.outputPath],
          ['', ''],
          ...assetsData
        ]);

        console.log(table);
      })
      .catch((err) => console.log(chalk.red(err)));
  }
}

module.exports = tasks;
