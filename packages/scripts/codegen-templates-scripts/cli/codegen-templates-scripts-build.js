#!/usr/bin/env node

const program = require('commander');
const webpack = require('webpack');
const path = require('path');
const rimraf = require('rimraf');

program.parse(process.argv);

const newProjectDir = process.cwd();
const scriptsPath = path.resolve(__dirname);
const webpackConfigPath = path.join(scriptsPath, '../webpack.config.js');
const webpackConfig = require(webpackConfigPath);

console.log('Building GraphQL Code Generator template project: ' + newProjectDir);

webpackConfig.context = path.join(newProjectDir, './src/');
webpackConfig.output.path = path.join(newProjectDir, './dist/');

rimraf.sync(webpackConfig.output.path);

webpack(webpackConfig, (err, stats) => {
  if (err) {
    console.error(err.stack || err);

    if (err.details) {
      console.error(err.details);
    }

    return;
  }

  const info = stats.toString({
    colors: true,
    hash: false,
    chunks: false,
    assets: false,
    children: false,
    version: false,
    timings: false,
    modules: false
  });

  if (info) {
    console.log(info);
  }

  if (stats.hasErrors()) {
    process.exit(1);
  }
});
