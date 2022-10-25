import { Types } from '@graphql-codegen/plugin-helpers';
import { debugLog } from './utils/debugging.js';
import { exec } from 'child_process';
import { delimiter, sep } from 'path';
import { quote } from 'shell-quote';

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

function normalizeHooks(
  _hooks: Partial<Types.LifecycleHooksDefinition>
): Types.LifecycleHooksDefinition<(string | Types.HookFunction)[]> {
  const keys = Object.keys({
    ...DEFAULT_HOOKS,
    ..._hooks,
  });

  return keys.reduce((prev: Types.LifecycleHooksDefinition<(string | Types.HookFunction)[]>, hookName: string) => {
    if (typeof _hooks[hookName] === 'string') {
      return {
        ...prev,
        [hookName]: [_hooks[hookName]] as string[],
      };
    }
    if (typeof _hooks[hookName] === 'function') {
      return {
        ...prev,
        [hookName]: [_hooks[hookName]],
      };
    }
    if (Array.isArray(_hooks[hookName])) {
      return {
        ...prev,
        [hookName]: _hooks[hookName] as string[],
      };
    }
    return prev;
  }, {} as Types.LifecycleHooksDefinition<(string | Types.HookFunction)[]>);
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
          // eslint-disable-next-line no-console
          console.error(error);
        } else {
          debugLog(stdout || stderr);
          resolve(stdout || stderr);
        }
      }
    );
  });
}

async function executeHooks(
  hookName: string,
  scripts: (string | Types.HookFunction)[] = [],
  args: string[] = []
): Promise<void> {
  debugLog(`Running lifecycle hook "${hookName}" scripts...`);

  const quotedArgs = quote(args);
  for (const script of scripts) {
    if (typeof script === 'string') {
      debugLog(`Running lifecycle hook "${hookName}" script: ${script} with args: ${quotedArgs}...`);
      await execShellCommand(`${script} ${quotedArgs}`);
    } else {
      debugLog(`Running lifecycle hook "${hookName}" script: ${script.name} with args: ${args.join(' ')}...`);
      await script(...args);
    }
  }
}

export const lifecycleHooks = (_hooks: Partial<Types.LifecycleHooksDefinition> = {}) => {
  const hooks = normalizeHooks(_hooks);

  return {
    afterStart: async (): Promise<void> => executeHooks('afterStart', hooks.afterStart),
    onWatchTriggered: async (event: string, path: string): Promise<void> =>
      executeHooks('onWatchTriggered', hooks.onWatchTriggered, [event, path]),
    onError: async (error: string): Promise<void> => executeHooks('onError', hooks.onError, [error]),
    afterOneFileWrite: async (path: string): Promise<void> =>
      executeHooks('afterOneFileWrite', hooks.afterOneFileWrite, [path]),
    afterAllFileWrite: async (paths: string[]): Promise<void> =>
      executeHooks('afterAllFileWrite', hooks.afterAllFileWrite, paths),
    beforeOneFileWrite: async (path: string): Promise<void> =>
      executeHooks('beforeOneFileWrite', hooks.beforeOneFileWrite, [path]),
    beforeAllFileWrite: async (paths: string[]): Promise<void> =>
      executeHooks('beforeAllFileWrite', hooks.beforeAllFileWrite, paths),
    beforeDone: async (): Promise<void> => executeHooks('beforeDone', hooks.beforeDone),
  };
};
