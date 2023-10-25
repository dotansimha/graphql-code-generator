import { resolve } from 'path';
import { Types } from '@graphql-codegen/plugin-helpers';

export const isDelayedSchemaGeneratorConfig = (schema: Types.Schema): schema is Types.DelayedSchemaGeneratorOptions => {
  return typeof schema === 'object' && Object.keys(schema).includes('delayed-schema-generator');
};

export async function getDelayedSchemaGenerator(
  config: Types.DelayedSchemaGeneratorOptions,
  loader: Types.PackageLoaderFn<Types.DelayedSchemaGeneratorFunction>
): Promise<Types.ConfiguredDelayedSchemaGenerator> {
  if (isFunctionConfig(config)) {
    return { generator: config['delayed-schema-generator'] };
  }
  if (isFileNameConfig(config)) {
    const generator = await getDelayedSchemaGeneratorByName(config['delayed-schema-generator'], loader);
    return { generator };
  }

  throw new Error(
    `
        An unknown format delayed schema generator.
    `
  );
}

function isFunctionConfig(
  config: Types.DelayedSchemaGeneratorOptions
): config is { 'delayed-schema-generator': Types.DelayedSchemaGeneratorFunction } {
  return (
    typeof config === 'object' &&
    config['delayed-schema-generator'] &&
    typeof config['delayed-schema-generator'] === 'function'
  );
}

function isFileNameConfig(
  config: Types.DelayedSchemaGeneratorOptions
): config is { 'delayed-schema-generator': string } {
  return (
    typeof config === 'object' &&
    config['delayed-schema-generator'] &&
    typeof config['delayed-schema-generator'] === 'string'
  );
}

export async function getDelayedSchemaGeneratorByName(
  name: string,
  loader: Types.PackageLoaderFn<Types.DelayedSchemaGeneratorFunction>
): Promise<Types.DelayedSchemaGeneratorFunction> {
  const possibleNames = [
    `@graphql-codegen/${name}`,
    `@graphql-codegen/${name}-delayed-schema-generator`,
    name,
    resolve(process.cwd(), name),
  ];

  const possibleModules = possibleNames.concat(resolve(process.cwd(), name));

  for (const moduleName of possibleModules) {
    try {
      const loadedObject = (await loader(moduleName)) as unknown as { generator: any };
      if (!loadedObject?.generator || typeof loadedObject.generator !== 'function') {
        throw new Error(`This module '${moduleName}' does not export the 'generator' function.`);
      }
      return loadedObject.generator;
    } catch (err) {
      if (err.code !== 'MODULE_NOT_FOUND' && err.code !== 'ERR_MODULE_NOT_FOUND') {
        throw new Error(
          `
              Unable to load delayed schema generator matching '${name}'.
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
    `.trimEnd()
    )
    .join('');

  throw new Error(
    `
        Unable to find delayed schema generator matching '${name}'
        Install one of the following packages:

        ${possibleNamesMsg}
      `
  );
}
