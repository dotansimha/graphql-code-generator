export type LifecycleHookScript = string[];

export type LifecycleHooksDefinition = {
  afterStart: LifecycleHookScript;
  afterConfig: LifecycleHookScript;
  beforeDone: LifecycleHookScript;
  onWatchTriggered: LifecycleHookScript;
  onError: LifecycleHookScript;
  afterOneFileWrite: LifecycleHookScript;
  afterAllFileWrite: LifecycleHookScript;
  beforeOneFileWrite: LifecycleHookScript;
  beforeAllFileWrite: LifecycleHookScript;
};

const DEFAULT_HOOKS: LifecycleHooksDefinition = {
  afterStart: [],
  afterConfig: [],
  beforeDone: [],
  onWatchTriggered: [],
  onError: [],
  afterOneFileWrite: [],
  afterAllFileWrite: [],
  beforeOneFileWrite: [],
  beforeAllFileWrite: [],
};

let hooks: LifecycleHooksDefinition = DEFAULT_HOOKS;

export function registerHooks(_hooks: Partial<LifecycleHooksDefinition> = {}): void {
  hooks = normalizeHooks(_hooks);
}

function normalizeHooks(_hooks: Partial<LifecycleHooksDefinition>): LifecycleHooksDefinition {
  return Object.keys({
    ...DEFAULT_HOOKS,
    ...(_hooks || {}),
  }).reduce(
    (prev: LifecycleHooksDefinition, hookName: string) => {
      if (typeof _hooks[hookName] === 'string') {
        return {
          ...prev,
          [hookName]: [_hooks[hookName]],
        };
      } else {
        return {
          ...prev,
          [hookName]: _hooks[hookName],
        };
      }
    },
    {} as LifecycleHooksDefinition
  );
}

async function executeHooks(scripts: LifecycleHookScript, args: string[] = []): Promise<void> {
  for (const script of scripts) {
    // TODO: Run scripts
  }
}

export const lifecycleHooks = {
  afterStart: async (): Promise<void> => executeHooks(hooks.afterStart),
  afterConfig: async (configFile: string): Promise<void> => executeHooks(hooks.afterConfig, [configFile]),
  onWatchTriggered: async (event: string, path: string): Promise<void> => executeHooks(hooks.onWatchTriggered, [event, path]),
  onError: async (error: string): Promise<void> => executeHooks(hooks.onError, [error]),
  afterOneFileWrite: async (path: string): Promise<void> => executeHooks(hooks.afterOneFileWrite, [path]),
  afterAllFileWrite: async (paths: string[]): Promise<void> => executeHooks(hooks.afterAllFileWrite, paths),
  beforeOneFileWrite: async (path: string): Promise<void> => executeHooks(hooks.beforeOneFileWrite, [path]),
  beforeAllFileWrite: async (paths: string[]): Promise<void> => executeHooks(hooks.beforeAllFileWrite, paths),
  beforeDone: async (): Promise<void> => executeHooks(hooks.beforeDone),
};
