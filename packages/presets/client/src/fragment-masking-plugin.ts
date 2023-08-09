import type { PluginFunction } from '@graphql-codegen/plugin-helpers';

const typeUtils = `
type Prettify<T> = {
  [K in keyof T]: T[K];
} & {};
type ValuesOf<T> = T[keyof T];
type UnionToIntersection<U> = (U extends any ? (k: U) => void : never) extends (k: infer I) => void ? I : never;
`;

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

const unmaskFragmentTypeHelper = `
/**
 * Helper for unmasking a fragment type.
 *
 * @example
 *
 * \`\`\`ts
 * type FilmProducersFragment = {
 *   __typename?: 'Film';
 *   id: string;
 *   producers?: Array<string | null> | null;
 * } & { ' $fragmentName'?: 'FilmProducersFragment' };
 *
 * type FilmItemFragment = {
 *   __typename?: 'Film';
 *   id: string;
 *   title?: string | null;
 * } & {
 *   ' $fragmentRefs'?: { FilmProducersFragment: FilmProducersFragment };
 * } & { ' $fragmentName'?: 'FilmItemFragment' };
 *
 * // Fragment references are all inlined rather than referring to \` $fragmentRefs\`.
 * type UnmaskedData = UnmaskFragmentType<FilmItemFragment>;
 * //   ^? type UnmaskedData = {
 * //      __typename?: "Film" | undefined;
 * //      id: string;
 * //      title?: string | null | undefined;
 * //      producers?: (string | null)[] | null | undefined;
 * //    }
 * \`\`\`
 */
export type UnmaskFragmentType<TType> = TType extends { ' $fragmentRefs'?: infer TRefs }
  ? Prettify<
      UnmaskFragmentType<
        Omit<TType, ' $fragmentRefs' | ' $fragmentName'> & Omit<UnionToIntersection<ValuesOf<TRefs>>, ' $fragmentName'>
      >
    >
  : TType extends { [K in keyof TType]: any }
  ? { [K in keyof TType]: UnmaskFragmentType<TType[K]> }
  : never;
`;

const unmaskResultOfHelper = `
/**
 * Helper for unmasking the result of a GraphQL document (\`DocumentType\`).
 *
 * @example
 *
 * \`\`\`ts
 * const FilmItemFragment = graphql(\`
 *   fragment FilmItem on Film {
 *     id
 *     title
 *   }
 * \`);
 *
 * const myQuery = graphql(\`
 *   query Films {
 *     allFilms {
 *       films {
 *         ...FilmItem
 *       }
 *     }
 *   }
 * \`); // DocumentTypeDecoration<R, V>
 *
 * // Fragment references are all inlined rather than referring to \` $fragmentRefs\`.
 * type UnmaskedData = UnmaskResultOf<typeof myQuery>;
 * //   ^? type UnmaskedData = {
 * //        __typename: 'Root' | undefined,
 * //        allFilms: {
 * //          films: {
 * //            __typename?: "Film" | undefined;
 * //            id: string;
 * //            title?: string | null | undefined;
 * //          }[] | null | undefined
 * //        } | null | undefined
 * //      }
 * \`\`\`
 */
export type UnmaskResultOf<TDocumentType extends DocumentTypeDecoration<any, any>> =
  TDocumentType extends DocumentTypeDecoration<infer TType, any> ? UnmaskFragmentType<TType> : never;
`;

const defaultUnmaskFunctionName = 'useFragment';

const modifyType = (
  rawType: string,
  opts: { nullable: boolean; list: 'with-list' | 'only-list' | false; empty?: boolean }
) => {
  return `${
    opts.list === 'only-list'
      ? `ReadonlyArray<${rawType}>`
      : opts.list === 'with-list'
      ? `${rawType} | ReadonlyArray<${rawType}>`
      : rawType
  }${opts.nullable ? ' | null | undefined' : ''}`;
};

const createUnmaskFunctionTypeDefinition = (
  unmaskFunctionName = defaultUnmaskFunctionName,
  opts: { nullable: boolean; list: 'with-list' | 'only-list' | false }
) => {
  return `export function ${unmaskFunctionName}<TType>(
  _documentNode: DocumentTypeDecoration<TType, any>,
  fragmentType: ${modifyType(`FragmentType<DocumentTypeDecoration<TType, any>>`, opts)}
): ${modifyType('TType', opts)}`;
};

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
${createUnmaskFunctionTypeDefinitions(unmaskFunctionName)
  .concat(createUnmaskFunctionTypeDefinition(unmaskFunctionName, { nullable: true, list: 'with-list' }))
  .join(';\n')} {
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
  isStringDocumentMode?: boolean;
}> = (
  _,
  __,
  { useTypeImports, augmentedModuleName, unmaskFunctionName, emitLegacyCommonJSImports, isStringDocumentMode },
  _info
) => {
  const documentNodeImport = `${useTypeImports ? 'import type' : 'import'} { ResultOf, DocumentTypeDecoration${
    isStringDocumentMode ? '' : ', TypedDocumentNode'
  } } from '@graphql-typed-document-node/core';\n`;

  const deferFragmentHelperImports = `${useTypeImports ? 'import type' : 'import'} { Incremental${
    isStringDocumentMode ? ', TypedDocumentString' : ''
  } } from './graphql${emitLegacyCommonJSImports ? '' : '.js'}';\n`;

  const fragmentDefinitionNodeImport = isStringDocumentMode
    ? ''
    : `${useTypeImports ? 'import type' : 'import'} { FragmentDefinitionNode } from 'graphql';\n`;

  if (augmentedModuleName == null) {
    return [
      documentNodeImport,
      fragmentDefinitionNodeImport,
      deferFragmentHelperImports,
      `\n`,
      typeUtils,
      `\n`,
      fragmentTypeHelper,
      `\n`,
      createUnmaskFunction(unmaskFunctionName),
      `\n`,
      makeFragmentDataHelper,
      `\n`,
      unmaskFragmentTypeHelper,
      `\n`,
      unmaskResultOfHelper,
      isFragmentReadyFunction(isStringDocumentMode),
    ].join(``);
  }

  return [
    documentNodeImport,
    `declare module "${augmentedModuleName}" {`,
    [
      typeUtils,
      `\n`,
      ...fragmentTypeHelper.split(`\n`),
      `\n`,
      ...createUnmaskFunctionTypeDefinitions(unmaskFunctionName).join('\n').split('\n'),
      `\n`,
      makeFragmentDataHelper,
      `\n`,
      unmaskFragmentTypeHelper,
      `\n`,
      unmaskResultOfHelper,
    ]
      .map(line => (line === `\n` || line === '' ? line : `  ${line}`))
      .join(`\n`),
    `}`,
  ].join(`\n`);
};
