import { Types } from 'graphql-codegen-plugin-helpers';
import { safeLoad } from 'js-yaml';

export function parseConfigFile(ymlString: string): Types.Config {
  if (typeof process !== 'undefined' && 'env' in process) {
    ymlString = ymlString.replace(/\$\{(.*)\}/g, (str, variable, index) => process.env[variable]);
  }

  return safeLoad(ymlString) as Types.Config;
}
