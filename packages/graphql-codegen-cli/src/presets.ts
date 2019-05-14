import { Types } from '@graphql-codegen/plugin-helpers';
import { resolve } from 'path';
import { DetailedError } from '@graphql-codegen/core';

export async function getPresetByName(name: string, loader: Types.PackageLoaderFn<{ preset?: Types.OutputPreset; default?: Types.OutputPreset }>): Promise<Types.OutputPreset> {
  const possibleNames = [`@graphql-codegen/${name}`, `@graphql-codegen/${name}-preset`, name];
  const possibleModules = possibleNames.concat(resolve(process.cwd(), name));

  for (const moduleName of possibleModules) {
    try {
      const loaded = await loader(moduleName);

      if (loaded && loaded.preset) {
        return loaded.preset as Types.OutputPreset;
      } else if (loaded && loaded.default) {
        return loaded.default as Types.OutputPreset;
      }

      return loaded as Types.OutputPreset;
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
