import { Types, CodegenPlugin } from 'graphql-codegen-plugin-helpers';
import { resolve } from 'path';
import { DetailedError } from './errors';

export async function getPluginByName(name: string, pluginLoader: Types.PluginLoaderFn): Promise<CodegenPlugin> {
  const possibleNames = [
    `graphql-codegen-${name}`,
    `graphql-codegen-${name}-template`,
    `codegen-${name}`,
    `codegen-${name}-template`,
    name
  ];
  const possibleModules = possibleNames.concat(resolve(process.cwd(), name));

  for (const moduleName of possibleModules) {
    try {
      return (await pluginLoader(moduleName)) as CodegenPlugin;
    } catch (err) {
      if (err.message.indexOf(`Cannot find module '${moduleName}'`) === -1) {
        throw new DetailedError(
          `Unable to load template plugin matching ${name}`,
          `
              Unable to load template plugin matching '${name}'.
              Reason: 
                ${err.message}
            `
        );
      }
    }
  }

  const possibleNamesMsg = possibleNames
    .map(name =>
      `
        - ${name}
    `.trimRight()
    )
    .join('');

  throw new DetailedError(
    `Unable to find template plugin matching ${name}`,
    `
        Unable to find template plugin matching '${name}'
        Install one of the following packages:
        
        ${possibleNamesMsg}
      `
  );
}
