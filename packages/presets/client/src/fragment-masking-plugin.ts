import { normalizeImportExtension, type PluginFunction } from '@graphql-codegen/plugin-helpers';

const fragmentTypeHelper = `
export type FragmentType<TDocumentType extends DocumentTypeDecoration<any, any>> = TDocumentType extends DocumentTypeDecoration<
  infer TType,
  any
>
  ? [TType] extends [{ ' $fragmentName'?: infer TKey }]
    ? TKey extends string
      ? { ' $fragmentRefs'?: { [key in TKey]: TType } }
      : never
    : never
  : never;`;

const makeFragmentDataHelper = `
export function makeFragmentData<
  F extends DocumentTypeDecoration<any, any>,
  FT extends ResultOf<F>
>(data: FT, _fragment: F): FragmentType<F> {
  return data as FragmentType<F>;
}`;

const defaultUnmaskFunctionName = 'useFragment';

const createUnmaskFunctionTypeDefinitions = (unmaskFunctionName = defaultUnmaskFunctionName) => [
  `// return non-nullable if \`fragmentType\` is non-nullable
export function ${unmaskFunctionName}<TType>(
  _documentNode: DocumentTypeDecoration<TType, any>,
  fragmentType: FragmentType<DocumentTypeDecoration<TType, any>>
): TType;`,

  `// return nullable if \`fragmentType\` is undefined
export function ${unmaskFunctionName}<TType>(
  _documentNode: DocumentTypeDecoration<TType, any>,
  fragmentType: FragmentType<DocumentTypeDecoration<TType, any>> | undefined
): TType | undefined;`,

  `// return nullable if \`fragmentType\` is nullable
export function ${unmaskFunctionName}<TType>(
  _documentNode: DocumentTypeDecoration<TType, any>,
  fragmentType: FragmentType<DocumentTypeDecoration<TType, any>> | null
): TType | null;`,

  `// return nullable if \`fragmentType\` is nullable or undefined
export function ${unmaskFunctionName}<TType>(
  _documentNode: DocumentTypeDecoration<TType, any>,
  fragmentType: FragmentType<DocumentTypeDecoration<TType, any>> | null | undefined
): TType | null | undefined;`,

  `// return array of non-nullable if \`fragmentType\` is array of non-nullable
export function ${unmaskFunctionName}<TType>(
  _documentNode: DocumentTypeDecoration<TType, any>,
  fragmentType: Array<FragmentType<DocumentTypeDecoration<TType, any>>>
): Array<TType>;`,

  `// return array of nullable if \`fragmentType\` is array of nullable
export function ${unmaskFunctionName}<TType>(
  _documentNode: DocumentTypeDecoration<TType, any>,
  fragmentType: Array<FragmentType<DocumentTypeDecoration<TType, any>>> | null | undefined
): Array<TType> | null | undefined;`,

  `// return readonly array of non-nullable if \`fragmentType\` is array of non-nullable
export function ${unmaskFunctionName}<TType>(
  _documentNode: DocumentTypeDecoration<TType, any>,
  fragmentType: ReadonlyArray<FragmentType<DocumentTypeDecoration<TType, any>>>
): ReadonlyArray<TType>;`,

  `// return readonly array of nullable if \`fragmentType\` is array of nullable
export function ${unmaskFunctionName}<TType>(
  _documentNode: DocumentTypeDecoration<TType, any>,
  fragmentType: ReadonlyArray<FragmentType<DocumentTypeDecoration<TType, any>>> | null | undefined
): ReadonlyArray<TType> | null | undefined;`,
];

const createUnmaskFunction = (unmaskFunctionName = defaultUnmaskFunctionName) => `
${createUnmaskFunctionTypeDefinitions(unmaskFunctionName).join('\n')}
export function ${unmaskFunctionName}<TType>(
  _documentNode: DocumentTypeDecoration<TType, any>,
  fragmentType: FragmentType<DocumentTypeDecoration<TType, any>> | Array<FragmentType<DocumentTypeDecoration<TType, any>>> | ReadonlyArray<FragmentType<DocumentTypeDecoration<TType, any>>> | null | undefined
): TType | Array<TType> | ReadonlyArray<TType> | null | undefined {
  return fragmentType as any;
}
`;

const isFragmentReadyFunction = (isStringDocumentMode: boolean) => {
  if (isStringDocumentMode) {
    return `\
export function isFragmentReady<TQuery, TFrag>(
  queryNode: TypedDocumentString<TQuery, any>,
  fragmentNode: TypedDocumentString<TFrag, any>,
  data: FragmentType<TypedDocumentString<Incremental<TFrag>, any>> | null | undefined
): data is FragmentType<typeof fragmentNode> {
  const deferredFields = queryNode.__meta__?.deferredFields as Record<string, (keyof TFrag)[]>;
  const fragName = fragmentNode.__meta__?.fragmentName as string | undefined;

  if (!deferredFields || !fragName) return true;

  const fields = deferredFields[fragName] ?? [];
  return fields.length > 0 && fields.every(field => data && field in data);
}
`;
  }
  return `\
export function isFragmentReady<TQuery, TFrag>(
  queryNode: DocumentTypeDecoration<TQuery, any>,
  fragmentNode: TypedDocumentNode<TFrag>,
  data: FragmentType<TypedDocumentNode<Incremental<TFrag>, any>> | null | undefined
): data is FragmentType<typeof fragmentNode> {
  const deferredFields = (queryNode as { __meta__?: { deferredFields: Record<string, (keyof TFrag)[]> } }).__meta__
    ?.deferredFields;

  if (!deferredFields) return true;

  const fragDef = fragmentNode.definitions[0] as FragmentDefinitionNode | undefined;
  const fragName = fragDef?.name?.value;

  const fields = (fragName && deferredFields[fragName]) || [];
  return fields.length > 0 && fields.every(field => data && field in data);
}
`;
};

/**
 * Plugin for generating fragment masking helper functions.
 */
export const plugin: PluginFunction<{
  useTypeImports?: boolean;
  augmentedModuleName?: string;
  unmaskFunctionName?: string;
  emitLegacyCommonJSImports?: boolean;
  importExtension?: '' | `.${string}`;
  isStringDocumentMode?: boolean;
}> = (
  _,
  __,
  {
    useTypeImports,
    augmentedModuleName,
    unmaskFunctionName,
    emitLegacyCommonJSImports,
    importExtension,
    isStringDocumentMode,
  },
  _info
) => {
  const appendedImportExtension = normalizeImportExtension({
    emitLegacyCommonJSImports,
    importExtension,
  });
  const documentNodeImport = `${useTypeImports ? 'import type' : 'import'} { ResultOf, DocumentTypeDecoration${
    isStringDocumentMode ? '' : ', TypedDocumentNode'
  } } from '@graphql-typed-document-node/core';\n`;

  const deferFragmentHelperImports = `${useTypeImports ? 'import type' : 'import'} { Incremental${
    isStringDocumentMode ? ', TypedDocumentString' : ''
  } } from './graphql${appendedImportExtension}';\n`;

  const fragmentDefinitionNodeImport = isStringDocumentMode
    ? ''
    : `${useTypeImports ? 'import type' : 'import'} { FragmentDefinitionNode } from 'graphql';\n`;

  if (augmentedModuleName == null) {
    return [
      documentNodeImport,
      fragmentDefinitionNodeImport,
      deferFragmentHelperImports,
      `\n`,
      fragmentTypeHelper,
      `\n`,
      createUnmaskFunction(unmaskFunctionName),
      `\n`,
      makeFragmentDataHelper,
      `\n`,
      isFragmentReadyFunction(isStringDocumentMode),
    ].join(``);
  }

  return [
    documentNodeImport,
    `declare module "${augmentedModuleName}" {`,
    [
      ...fragmentTypeHelper.split(`\n`),
      `\n`,
      ...createUnmaskFunctionTypeDefinitions(unmaskFunctionName).join('\n').split('\n'),
      `\n`,
      makeFragmentDataHelper,
    ]
      .map(line => (line === `\n` || line === '' ? line : `  ${line}`))
      .join(`\n`),
    `}`,
  ].join(`\n`);
};
