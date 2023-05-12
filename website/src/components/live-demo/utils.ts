import { Config } from './formatter';

export function normalizeConfig(config: Config['generates'][0]) {
  if (typeof config === 'string') {
    return [{ [config]: {} }];
  }
  if (Array.isArray(config)) {
    return config.map(plugin => (typeof plugin === 'string' ? { [plugin]: {} } : plugin));
  }
  if (typeof config === 'object') {
    return Object.keys(config).reduce<Record<string, any>[]>((prev, pluginName) => {
      if (pluginName === 'preset') return prev;
      return [...prev, { [pluginName]: config[pluginName] }];
    }, []);
  }
  return [];
}
