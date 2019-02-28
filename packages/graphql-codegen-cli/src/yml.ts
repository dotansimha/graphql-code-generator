import { Types, debugLog } from 'graphql-codegen-core';
import { safeLoad } from 'js-yaml';

export function parseConfigFile(ymlString: string): Types.Config {
  if (typeof process !== 'undefined' && 'env' in process) {
    debugLog(`[CLI] Interpolation of Environmental Variables`);
    ymlString = ymlString.replace(/\$\{(.*)\}/g, (str, variable, index) => process.env[variable]);
  }
  debugLog(`[CLI] Parsing YAML file`);
  return safeLoad(ymlString) as Types.Config;
}
