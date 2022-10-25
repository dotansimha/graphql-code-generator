import type { PluginFunction } from '@graphql-codegen/plugin-helpers';

const fragmentTypeHelper = `
export type FragmentType<TDocumentType extends DocumentNode<any, any>> = TDocumentType extends DocumentNode<
  infer TType,
  any
>
  ? TType extends { ' $fragmentName'?: infer TKey }
    ? TKey extends string
      ? { ' $fragmentRefs'?: { [key in TKey]: TType } }
      : never
    : never
  : never;`;

const defaultUnmaskFunctionName = 'useFragment';

const modifyType = (rawType: string, opts: { nullable: boolean; list: 'with-list' | 'only-list' | false }) =>
  `${
    opts.list === 'only-list'
      ? `ReadonlyArray<${rawType}>`
      : opts.list === 'with-list'
      ? `${rawType} | ReadonlyArray<${rawType}>`
      : rawType
  }${opts.nullable ? ' | null | undefined' : ''}`;

const createUnmaskFunctionTypeDefinition = (
  unmaskFunctionName = defaultUnmaskFunctionName,
  opts: { nullable: boolean; list: 'with-list' | 'only-list' | false }
) => `export function ${unmaskFunctionName}<TType>(
  _documentNode: DocumentNode<TType, any>,
  fragmentType: ${modifyType('FragmentType<DocumentNode<TType, any>>', opts)}
): ${modifyType('TType', opts)}`;

const createUnmaskFunctionTypeDefinitions = (unmaskFunctionName = defaultUnmaskFunctionName) => [
  `// return non-nullable if \`fragmentType\` is non-nullable\n${createUnmaskFunctionTypeDefinition(
    unmaskFunctionName,
    { nullable: false, list: false }
  )}`,
  `// return nullable if \`fragmentType\` is nullable\n${createUnmaskFunctionTypeDefinition(unmaskFunctionName, {
    nullable: true,
    list: false,
  })}`,
  `// return array of non-nullable if \`fragmentType\` is array of non-nullable\n${createUnmaskFunctionTypeDefinition(
    unmaskFunctionName,
    { nullable: false, list: 'only-list' }
  )}`,
  `// return array of nullable if \`fragmentType\` is array of nullable\n${createUnmaskFunctionTypeDefinition(
    unmaskFunctionName,
    { nullable: true, list: 'only-list' }
  )}`,
];

const createUnmaskFunction = (unmaskFunctionName = defaultUnmaskFunctionName) => `
${createUnmaskFunctionTypeDefinitions(unmaskFunctionName).join(';\n')}
${createUnmaskFunctionTypeDefinition(unmaskFunctionName, { nullable: true, list: 'with-list' })} {
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
    [
      ...fragmentTypeHelper.split(`\n`),
      `\n`,
      ...createUnmaskFunctionTypeDefinitions(unmaskFunctionName).join('\n').split('\n'),
    ]
      .map(line => (line === `\n` || line === '' ? line : `  ${line}`))
      .join(`\n`),
    `}`,
  ].join(`\n`);
};
