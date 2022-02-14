import type { PluginFunction } from '@graphql-codegen/plugin-helpers';

const fragmentTypeHelper = `
export type FragmentType<TDocumentType extends DocumentNode<any, any>> = TDocumentType extends DocumentNode<
  infer TType,
  any
>
  ? TType extends { ' $fragmentName': infer TKey }
    ? TKey extends string
      ? { ' $fragmentRefs': { [key in TKey]: TType } }
      : never
    : never
  : never;`;

const defaultUnmaskFunctionName = 'useFragment';

const createUnmaskFunctionTypeDefinition = (unmaskFunctionName = defaultUnmaskFunctionName) => `
export function ${unmaskFunctionName}<TType>(
  _documentNode: DocumentNode<TType, any>,
  fragmentType: FragmentType<DocumentNode<TType, any>>
): TType`;

const createUnmaskFunction = (unmaskFunctionName = defaultUnmaskFunctionName) => `
${createUnmaskFunctionTypeDefinition(unmaskFunctionName)} {
  return fragmentType as any
}
`;

/**
 * Plugin for generating fragment masking helper functions.
 */
export const plugin: PluginFunction<{
  useTypeImports?: boolean;
  augmentedModuleName?: string;
  unmaskFunctionName?: string;
}> = (_, __, { useTypeImports, augmentedModuleName, unmaskFunctionName }, _info) => {
  const documentNodeImport = `${
    useTypeImports ? 'import type' : 'import'
  } { TypedDocumentNode as DocumentNode } from '@graphql-typed-document-node/core';\n`;

  if (augmentedModuleName == null) {
    return [documentNodeImport, `\n`, fragmentTypeHelper, `\n`, createUnmaskFunction(unmaskFunctionName)].join(``);
  }

  return [
    documentNodeImport,
    `declare module "${augmentedModuleName}" {`,
    [...fragmentTypeHelper.split(`\n`), `\n`, ...createUnmaskFunctionTypeDefinition(unmaskFunctionName).split(`\n`)]
      .map(line => (line === `\n` || line === '' ? line : `  ${line}`))
      .join(`\n`),
    `}`,
  ].join(`\n`);
};
