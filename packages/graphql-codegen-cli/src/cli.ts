import { generate } from './generate-and-save';
import { init } from './init';
import { createContext } from './config';
import { lifecycleHooks } from './hooks';
import { DetailedError } from '@graphql-codegen/plugin-helpers';

export function runCli(cmd: string): Promise<any> {
  ensureGraphQlPackage();

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

export function ensureGraphQlPackage() {
  try {
    require('graphql');
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
