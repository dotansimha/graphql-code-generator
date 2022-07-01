import { generate } from './generate-and-save';
import { init } from './init';
import { createContext } from './config';
import { lifecycleHooks } from './hooks';
import { DetailedError } from '@graphql-codegen/plugin-helpers';

export async function runCli(cmd: string): Promise<any> {
  await ensureGraphQlPackage();

  if (cmd === 'init') {
    return init();
  }

  const context = await createContext();
  try {
    return await generate(context);
  } catch (error) {
    await lifecycleHooks(context.getConfig().hooks).onError(error.toString());
    throw error;
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
