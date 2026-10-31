module.exports = {
  plugin: (_schema, _documents, config, { pluginContext }) => {
    const previousStageMeta = pluginContext.previousStageMeta || {};
    const typeNames = (previousStageMeta[config.fromPlugin] || {}).typeNames || [];
    return `// STAGE_TWO: ${typeNames.join(',')}`;
  },
};
