import { DetailedError, Types } from '@graphql-codegen/plugin-helpers';

export async function getPresetByName(
  name: string,
  loader: Types.PackageLoaderFn<{ preset?: Types.OutputPreset; default?: Types.OutputPreset }>
): Promise<Types.OutputPreset> {
  const possibleNames = [`@graphql-codegen/${name}`, `@graphql-codegen/${name}-preset`, name];

  for (const moduleName of possibleNames) {
    try {
      const loaded = await loader(moduleName);

      if (loaded && loaded.preset) {
        return loaded.preset;
      } else if (loaded && loaded.default) {
        return loaded.default;
      }

      return loaded as Types.OutputPreset;
    } catch (err) {
      if (err.code !== 'MODULE_NOT_FOUND' || !err.message.includes(moduleName)) {
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
