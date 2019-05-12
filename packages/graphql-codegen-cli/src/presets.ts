import { Types } from '@graphql-codegen/plugin-helpers';
import { resolve } from 'path';
import { DetailedError } from '@graphql-codegen/core';

export async function getPresetByName(name: string, loader: Types.PackageLoaderFn<Types.OutputPreset>): Promise<Types.OutputPreset> {
  const possibleNames = [`@graphql-codegen/${name}`, `@graphql-codegen/${name}-preset`, name];
  const possibleModules = possibleNames.concat(resolve(process.cwd(), name));

  for (const moduleName of possibleModules) {
    try {
      return (await loader(moduleName)) as Types.OutputPreset;
    } catch (err) {
      if (err.message.indexOf(`Cannot find module '${moduleName}'`) === -1) {
        throw new DetailedError(
          `Unable to load preset matching ${name}`,
          `
              Unable to load preset matching '${name}'.
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
    `Unable to find preset matching ${name}`,
    `
        Unable to find preset matching '${name}'
        Install one of the following packages:
        
        ${possibleNamesMsg}
      `
  );
}
