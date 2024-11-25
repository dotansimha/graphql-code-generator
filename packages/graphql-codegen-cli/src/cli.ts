import { createContext } from './config.js';
import { generate } from './generate-and-save.js';
import { lifecycleHooks } from './hooks.js';
import { init } from './init/index.js';

export async function runCli(cmd: string): Promise<number> {
  await ensureGraphQlPackage();

  if (cmd === 'init') {
    await init();
    return 0;
  }

  const context = await createContext();
  try {
    await generate(context);
    if (context.checkMode && context.checkModeStaleFiles.length > 0) {
      // eslint-disable-next-line no-console
      console.log(
        `The following stale files were detected:\n${context.checkModeStaleFiles.map(file => `  - ${file}\n`)}`
      );
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
  } catch {
    throw new Error(
      `Unable to load "graphql" package. Please make sure to install "graphql" as a dependency! \n
       To install "graphql", run:
         yarn add graphql
       Or, with NPM:
         npm install --save graphql`
    );
  }
}
