export function normalizeConfig(config) {
  if (typeof config === 'string') {
    return [{ [config]: {} }];
  } else if (Array.isArray(config)) {
    return config.map(plugin => (typeof plugin === 'string' ? { [plugin]: {} } : plugin));
  } else if (typeof config === 'object') {
    return Object.keys(config).reduce((prev, pluginName) => [...prev, { [pluginName]: config[pluginName] }], []);
  } else {
    return [];
  }
}
export const canUseDOM = !!(
    (typeof window !== 'undefined' &&
        window.document && window.document.createElement)
);
