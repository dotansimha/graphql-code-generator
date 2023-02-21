module.exports = {
  plugin: (_schema, _documents, _config, { pluginContext }) => {
    return `Hello ${pluginContext.myPluginInfo}!`;
  },
};
