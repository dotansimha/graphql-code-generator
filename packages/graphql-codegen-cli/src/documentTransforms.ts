import { resolve } from 'path';
import { Types } from '@graphql-codegen/plugin-helpers';

export async function getDocumentTransform(
  documentTransform: Types.OutputDocumentTransform,
  loader: Types.PackageLoaderFn<Types.DocumentTransformObject>,
  defaultName: string
): Promise<Types.ConfiguredDocumentTransform> {
  if (typeof documentTransform === 'string') {
    const transformObject = await getDocumentTransformByName(documentTransform, loader);
    return { name: documentTransform, transformObject };
  }
  if (isTransformObject(documentTransform)) {
    return { name: defaultName, transformObject: documentTransform };
  }
  if (isTransformFileConfig(documentTransform)) {
    const name = Object.keys(documentTransform)[0];
    const transformObject = await getDocumentTransformByName(name, loader);
    return { name, transformObject, config: Object.values(documentTransform)[0] };
  }
  throw new Error(
    `
        An unknown format document transform: '${defaultName}'.
    `
  );
}

function isTransformObject(config: Types.OutputDocumentTransform): config is Types.DocumentTransformObject {
  return typeof config === 'object' && config.transform && typeof config.transform === 'function';
}

function isTransformFileConfig(config: Types.OutputDocumentTransform): config is Types.DocumentTransformFileConfig {
  const keys = Object.keys(config);
  return keys.length === 1 && typeof keys[0] === 'string';
}

export async function getDocumentTransformByName(
  name: string,
  loader: Types.PackageLoaderFn<Types.DocumentTransformObject>
): Promise<Types.DocumentTransformObject> {
  const possibleNames = [
    `@graphql-codegen/${name}`,
    `@graphql-codegen/${name}-document-transform`,
    name,
    resolve(process.cwd(), name),
  ];

  const possibleModules = possibleNames.concat(resolve(process.cwd(), name));

  for (const moduleName of possibleModules) {
    try {
      return await loader(moduleName);
    } catch (err) {
      if (err.code !== 'MODULE_NOT_FOUND' && err.code !== 'ERR_MODULE_NOT_FOUND') {
        throw new Error(
          `
              Unable to load document transform matching '${name}'.
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
        Unable to find document transform matching '${name}'
        Install one of the following packages:

        ${possibleNamesMsg}
      `
  );
}
