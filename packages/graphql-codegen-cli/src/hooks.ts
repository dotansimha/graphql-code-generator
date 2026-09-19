import { exec } from 'child_process';
import { platform } from 'os';
import { delimiter, sep } from 'path';
import { quote } from 'shell-quote';
import { Types } from '@graphql-codegen/plugin-helpers';
import { debugLog } from './utils/debugging.js';

const DEFAULT_HOOKS: Types.LifecycleHooksDefinition = {
  afterStart: [],
  beforeDone: [],
  onWatchTriggered: [],
  onError: [],
  afterOneFileWrite: [],
  afterAllFileWrite: [],
  beforeOneFileWrite: [],
  beforeAllFileWrite: [],
};

// shell-quote's `quote()` always produces POSIX-style single-quoting, but
// `execShellCommand` below runs through `cmd.exe` on Windows (Node's
// `child_process.exec` default shell there), which doesn't understand single
// quotes and leaves them in literally. Quote per-platform instead: cmd.exe's
// own convention is double-quoting only the arguments that need it.
function quoteShellArgs(args: string[]): string {
  if (platform() === 'win32') {
    // Only wrap an argument that contains a character cmd.exe treats specially --
    // whitespace, pipe/redirection, caret, or a literal quote. e.g.
    // - `C:\Program Files\x.ts` becomes `"C:\Program Files\x.ts"`
    // - `D:\a\x.ts` is left bare.
    return args.map(arg => (/[\s&|<>^"]/.test(arg) ? `"${arg}"` : arg)).join(' ');
  }
  return quote(args);
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
      },
    );
  });
}

async function executeHooks(
  hookName: string,
  _scripts: Types.LifeCycleHookValue | Types.LifeCycleAlterHookValue = [],
  args: string[] = [],
  initialState?: string,
): Promise<void | string> {
  debugLog(`Running lifecycle hook "${hookName}" scripts...`);
  let state = initialState;
  const scripts = Array.isArray(_scripts) ? _scripts : [_scripts];

  const quotedArgs = quoteShellArgs(args);
  for (const script of scripts) {
    if (typeof script === 'string') {
      debugLog(
        `Running lifecycle hook "${hookName}" script: ${script} with args: ${quotedArgs}...`,
      );
      await execShellCommand(`${script} ${quotedArgs}`);
    } else {
      debugLog(
        `Running lifecycle hook "${hookName}" script: ${
          script.name
        } with args: ${args.join(' ')}...`,
      );
      const hookArgs = state === undefined ? args : [...args, state];
      const hookResult = await script(...hookArgs);
      if (typeof hookResult === 'string' && typeof state === 'string') {
        debugLog(`Received new content from lifecycle hook "${hookName}" script: ${script.name}`);
        state = hookResult;
      }
    }
  }

  return state;
}

export const lifecycleHooks = (_hooks: Partial<Types.LifecycleHooksDefinition> = {}) => {
  const hooks = {
    ...DEFAULT_HOOKS,
    ..._hooks,
  };

  return {
    afterStart: async (): Promise<void> => {
      await executeHooks('afterStart', hooks.afterStart);
    },
    onWatchTriggered: async (event: string, path: string): Promise<void> => {
      await executeHooks('onWatchTriggered', hooks.onWatchTriggered, [event, path]);
    },
    onError: async (error: string): Promise<void> => {
      await executeHooks('onError', hooks.onError, [error]);
    },
    afterOneFileWrite: async (path: string): Promise<void> => {
      await executeHooks('afterOneFileWrite', hooks.afterOneFileWrite, [path]);
    },
    afterAllFileWrite: async (paths: string[]): Promise<void> => {
      await executeHooks('afterAllFileWrite', hooks.afterAllFileWrite, paths);
    },
    beforeOneFileWrite: async (path: string, content: string): Promise<string> => {
      const result = await executeHooks(
        'beforeOneFileWrite',
        hooks.beforeOneFileWrite,
        [path],
        content,
      );
      return typeof result === 'string' ? result : content;
    },
    beforeAllFileWrite: async (paths: string[]): Promise<void> => {
      await executeHooks('beforeAllFileWrite', hooks.beforeAllFileWrite, paths);
    },
    beforeDone: async (): Promise<void> => {
      await executeHooks('beforeDone', hooks.beforeDone);
    },
  };
};
