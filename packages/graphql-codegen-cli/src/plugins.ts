import { DetailedError, Types, CodegenPlugin } from '@graphql-codegen/plugin-helpers';
import { resolve } from 'path';

export async function getPluginByName(
  name: string,
  pluginLoader: Types.PackageLoaderFn<CodegenPlugin>
): Promise<CodegenPlugin> {
  const possibleNames = [
    `@graphql-codegen/${name}`,
    `@graphql-codegen/${name}-template`,
    `@graphql-codegen/${name}-plugin`,
    `graphql-codegen-${name}`,
    `graphql-codegen-${name}-template`,
    `graphql-codegen-${name}-plugin`,
    `codegen-${name}`,
    `codegen-${name}-template`,
    name,
  ];
  const possibleModules = possibleNames.concat(resolve(process.cwd(), name));

  for (const moduleName of possibleModules) {
    try {
      return await pluginLoader(moduleName);
    } catch (err) {
      if (err.code !== 'MODULE_NOT_FOUND' || err.code !== 'ERR_MODULE_NOT_FOUND') {
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
