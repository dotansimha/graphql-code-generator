import { Types } from './types';
import { safeLoad } from 'js-yaml';

export function parseConfigFile(ymlString: string): Types.Config {
  return safeLoad(ymlString) as Types.Config;
}
