import { Types, debugLog } from 'graphql-codegen-core';
import { safeLoad } from 'js-yaml';

export function interpolate<T extends { [key: string]: string }>(str: string, context: T) {
  // tslint:disable-next-line:forin
  for (let key in context) {
    str = str.replace(new RegExp('\\$\\{' + key + '\\}', 'g'), context[key]);
  }
  return str;
}

export function parseConfigFile(ymlString: string): Types.Config {
  if (typeof process !== 'undefined' && 'env' in process) {
    debugLog(`[CLI] Interpolation of Environmental Variables`);
    ymlString = interpolate(ymlString, process.env);
  }
  debugLog(`[CLI] Parsing YAML file`);
  return safeLoad(ymlString) as Types.Config;
}
