module.exports = {
  plugin: (_schema, _documents, _config, { pluginContext }) => {
    return `Hello ${pluginContext.myPluginInfo}!`;
  },
  transformDocuments: (_schema, documents, _config, { pluginContext }) => {
    pluginContext.myPluginInfo = 'world';
    return documents;
  },
};
