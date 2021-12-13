export function normalizeConfig(config) {
  if (typeof config === 'string') {
    return [{ [config]: {} }];
  }
  if (Array.isArray(config)) {
    return config.map(plugin => (typeof plugin === 'string' ? { [plugin]: {} } : plugin));
  }
  if (typeof config === 'object') {
    return Object.keys(config).reduce((prev, pluginName) => [...prev, { [pluginName]: config[pluginName] }], []);
  }
  return [];
}
