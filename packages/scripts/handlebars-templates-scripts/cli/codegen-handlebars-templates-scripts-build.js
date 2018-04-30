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
  if (err || stats.hasErrors()) {
    console.error(stats);
  }
});
