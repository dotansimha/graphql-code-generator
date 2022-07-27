import { generate } from './generate-and-save.js';
import { init } from './init/index.js';
import { createContext } from './config.js';
import { lifecycleHooks } from './hooks.js';
import { DetailedError } from '@graphql-codegen/plugin-helpers';

export async function runCli(cmd: string): Promise<number> {
  await ensureGraphQlPackage();

  if (cmd === 'init') {
    init();
    return 0;
  }

  const context = await createContext();
  try {
    await generate(context);
    if (context.checkMode && context.checkModeStaleFiles.length > 0) {
      // eslint-disable-next-line no-console
      console.log(`The following files are stale were detected: ${context.checkModeStaleFiles.join('\n')}`);
      return 1;
    }
    return 0;
  } catch (error) {
    await lifecycleHooks(context.getConfig().hooks).onError(error.toString());
    return 1;
  }
}

export async function ensureGraphQlPackage() {
  try {
    await import('graphql');
  } catch (e) {
    throw new DetailedError(
      `Unable to load "graphql" package. Please make sure to install "graphql" as a dependency!`,
      `
  To install "graphql", run:
    yarn add graphql
  Or, with NPM:
    npm install --save graphql
`
    );
  }
}
