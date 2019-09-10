import { generate } from './generate-and-save';
import { init } from './init';
import { createConfig } from './config';
import { lifecycleHooks } from './hooks';

export function runCli(cmd: string): Promise<any> {
  switch (cmd) {
    case 'init':
      return init();
    default: {
      const config = createConfig();

      return config.then(config => {
        return generate(config).catch(async error => {
          await lifecycleHooks(config.hooks).onError(error.toString());

          throw error;
        });
      });
    }
  }
}
