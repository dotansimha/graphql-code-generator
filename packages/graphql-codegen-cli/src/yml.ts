import { Types } from '@graphql-codegen/plugin-helpers';
import { safeLoad } from 'js-yaml';

export function parseConfigFile(ymlString: string): Types.Config {
  if (typeof process !== 'undefined' && 'env' in process) {
    ymlString = ymlString.replace(/\$\{(.*)\}/g, (str, variable, index) => {
      let varName = variable;
      let defaultValue = '';

      if (variable.includes(':')) {
        const spl = variable.split(':');
        varName = spl.shift();
        defaultValue = spl.join(':');
      }

      return process.env[varName] || defaultValue;
    });
  }

  return safeLoad(ymlString) as Types.Config;
}
