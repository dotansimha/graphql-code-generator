module.exports = {
  plugin: (_schema, _documents, _config, { pluginContext }) => {
    return `// CONSUMER: ${JSON.stringify(pluginContext.output)}`;
  },
};
