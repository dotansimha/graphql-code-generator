import { Types } from '@graphql-codegen/plugin-helpers';
import { debugLog } from './utils/debugging';
import { exec } from 'child_process';
import { delimiter, sep } from 'path';

const DEFAULT_HOOKS: Types.LifecycleHooksDefinition<string[]> = {
  afterStart: [],
  beforeDone: [],
  onWatchTriggered: [],
  onError: [],
  afterOneFileWrite: [],
  afterAllFileWrite: [],
  beforeOneFileWrite: [],
  beforeAllFileWrite: [],
};

function normalizeHooks(_hooks: Partial<Types.LifecycleHooksDefinition<string | string[]>>): Types.LifecycleHooksDefinition<string[]> {
  const keys = Object.keys({
    ...DEFAULT_HOOKS,
    ...(_hooks || {}),
  });

  return keys.reduce(
    (prev: Types.LifecycleHooksDefinition<string[]>, hookName: string) => {
      if (typeof _hooks[hookName] === 'string') {
        return {
          ...prev,
          [hookName]: [_hooks[hookName]] as string[],
        };
      } else if (Array.isArray(_hooks[hookName])) {
        return {
          ...prev,
          [hookName]: _hooks[hookName] as string[],
        };
      } else {
        return prev;
      }
    },
    {} as Types.LifecycleHooksDefinition<string[]>
  );
}

function execShellCommand(cmd: string): Promise<string> {
  return new Promise((resolve, reject) => {
    exec(
      cmd,
      {
        env: {
          ...process.env,
          PATH: `${process.env.PATH}${delimiter}${process.cwd()}${sep}node_modules${sep}.bin`,
        },
      },
      (error, stdout, stderr) => {
        if (error) {
          reject(error);
        } else {
          resolve(stdout ? stdout : stderr);
        }
      }
    );
  });
}

async function executeHooks(hookName: string, scripts: string[] = [], args: string[] = []): Promise<void> {
  debugLog(`Running lifecycle hook "${hookName}" scripts...`);

  for (const script of scripts) {
    debugLog(`Running lifecycle hook "${hookName}" script: ${script} with args: ${args.join(' ')}...`);
    await execShellCommand(`${script} ${args.join(' ')}`);
  }
}

export const lifecycleHooks = (_hooks: Partial<Types.LifecycleHooksDefinition<string | string[]>> = {}) => {
  const hooks = normalizeHooks(_hooks);

  return {
    afterStart: async (): Promise<void> => executeHooks('afterStart', hooks.afterStart),
    onWatchTriggered: async (event: string, path: string): Promise<void> => executeHooks('onWatchTriggered', hooks.onWatchTriggered, [event, path]),
    onError: async (error: string): Promise<void> => executeHooks('onError', hooks.onError, [error]),
    afterOneFileWrite: async (path: string): Promise<void> => executeHooks('afterOneFileWrite', hooks.afterOneFileWrite, [path]),
    afterAllFileWrite: async (paths: string[]): Promise<void> => executeHooks('afterAllFileWrite', hooks.afterAllFileWrite, paths),
    beforeOneFileWrite: async (path: string): Promise<void> => executeHooks('beforeOneFileWrite', hooks.beforeOneFileWrite, [path]),
    beforeAllFileWrite: async (paths: string[]): Promise<void> => executeHooks('beforeAllFileWrite', hooks.beforeAllFileWrite, paths),
    beforeDone: async (): Promise<void> => executeHooks('beforeDone', hooks.beforeDone),
  };
};
