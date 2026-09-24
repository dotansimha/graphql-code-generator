/**
 * PoC fixture for https://github.com/dotansimha/graphql-code-generator/issues/10943
 * ("Option 1: Sequential Stages"). Stands in for a plugin like `typescript-resolvers`: it
 * reads the `meta` handed off by the previous stage's plugin (via
 * `pluginContext.previousStageMeta`, keyed by plugin name) instead of independently
 * re-deriving the same information.
 */
module.exports = {
  plugin(_schema, _documents, _config, { pluginContext }) {
    const previousStageMeta = pluginContext?.previousStageMeta || {};
    const stage1Meta = previousStageMeta['./tests/custom-plugins/sequential-stage-1.js'];
    const typeNames = stage1Meta?.typeNames || [];

    return `// Stage 2 (typescript-resolvers-like): received typeNames from stage 1 -> [${typeNames.join(', ')}]\n`;
  },
};
