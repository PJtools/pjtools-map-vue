// This config is for building dist files
const webpack = require('webpack');
const getWebpackConfig = require('../antd-tools/getWebpackConfig');

// noParse still leave `require('./locale' + name)` in dist files
// ignore is better
// http://stackoverflow.com/q/25384360
function ignoreMomentLocale(webpackConfig) {
  delete webpackConfig.module.noParse;
  webpackConfig.plugins.push(new webpack.IgnorePlugin(/^\.\/locale$/, /moment$/));
}

function addLocales(webpackConfig) {
  let packageName = 'pjmap-with-locales';
  if (webpackConfig.entry['pjmap.min']) {
    packageName += '.min';
  }
  webpackConfig.entry[packageName] = './build/index-with-locales.js';
  webpackConfig.output.filename = '[name].js';
}

function externalMoment(config) {
  config.externals.moment = {
    root: 'moment',
    commonjs2: 'moment',
    commonjs: 'moment',
    amd: 'moment',
  };
}

function externalAntdVue(config) {
  config.externals['ant-design-vue'] = {
    root: 'antd',
    commonjs2: 'ant-design-vue',
    commonjs: 'ant-design-vue',
    amd: 'ant-design-vue',
  };
}

function externalLodash(config) {
  config.externals.lodash = {
    root: '_',
    commonjs2: 'lodash',
    commonjs: 'lodash',
    amd: 'lodash',
  };
}

const webpackConfig = getWebpackConfig(false);
if (process.env.RUN_ENV === 'PRODUCTION') {
  webpackConfig.forEach(config => {
    ignoreMomentLocale(config);
    externalLodash(config);
    externalMoment(config);
    externalAntdVue(config);
    addLocales(config);
  });
}

module.exports = webpackConfig;
