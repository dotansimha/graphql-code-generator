export function normalizeConfig(config: any): any[] {
  if (typeof config === 'string') {
    return [{ [config]: {} }];
  } else if (Array.isArray(config)) {
    return config.map(plugin => (typeof plugin === 'string' ? { [plugin]: {} } : plugin));
  } else if (typeof config === 'object') {
    return Object.keys(config).reduce((prev, pluginName) => [...prev, { [pluginName]: config[pluginName] }] as any, []);
  } else {
    return [];
  }
}
