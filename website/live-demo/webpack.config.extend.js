module.exports = (webpackConfig, env, { paths }) => {
  webpackConfig.node.module = 'empty';

  return webpackConfig;
};
