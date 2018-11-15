import { Types } from 'graphql-codegen-core';
import { safeLoad } from 'js-yaml';

export function parseConfigFile(ymlString: string): Types.Config {
  return safeLoad(ymlString) as Types.Config;
}
