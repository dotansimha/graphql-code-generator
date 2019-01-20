import { Types, debugLog } from 'graphql-codegen-core';
import { safeLoad } from 'js-yaml';

export function parseConfigFile(ymlString: string): Types.Config {
  debugLog(`[CLI] Parsing YAML file`);
  return safeLoad(ymlString) as Types.Config;
}
