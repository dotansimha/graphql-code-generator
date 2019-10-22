import { generate } from './generate-and-save';
import { init } from './init';
import { createContext } from './config';
import { lifecycleHooks } from './hooks';

export function runCli(cmd: string): Promise<any> {
  switch (cmd) {
    case 'init':
      return init();
    default: {
      return createContext().then(context => {
        return generate(context).catch(async error => {
          await lifecycleHooks(context.getConfig().hooks).onError(error.toString());

          throw error;
        });
      });
    }
  }
}
