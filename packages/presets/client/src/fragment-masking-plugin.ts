import type { PluginFunction } from '@graphql-codegen/plugin-helpers';

const fragmentTypeHelper = `
export type FragmentType<TDocumentType extends DocumentTypeDecoration<any, any>> = TDocumentType extends DocumentTypeDecoration<
  infer TType,
  any
>
  ? TType extends { ' $fragmentName'?: infer TKey }
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

const modifyType = (
  initialRawType: string,
  opts: { nullable: boolean; list: 'with-list' | 'only-list' | false; empty?: boolean }
) => {
  let rawType = initialRawType;
  if (opts.empty) {
    rawType = `${initialRawType} | Empty<${initialRawType}>`;
  }
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
  opts: { nullable: boolean; list: 'with-list' | 'only-list' | false },
  empty?: boolean
) => {
  const tType = empty ? 'Incremental<TType>' : 'TType';

  return `export function ${unmaskFunctionName}<TType>(
  _documentNode: DocumentTypeDecoration<TType, any>,
  fragmentType: ${modifyType(`FragmentType<DocumentTypeDecoration<${tType}, any>>`, opts)}
): ${modifyType('TType', { ...opts, empty })}`;
};

const createUnmaskFunctionTypeDefinitions = (unmaskFunctionName = defaultUnmaskFunctionName) => [
  `// return union with empty object if \`fragmentType\` is \`Incremental\n${createUnmaskFunctionTypeDefinition(
    unmaskFunctionName,
    { nullable: true, list: false },
    true
  )}`,
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
  } { ResultOf, DocumentTypeDecoration,  } from '@graphql-typed-document-node/core';\n`;

  const emitLegacyCommonJSImports = true; // todo
  const typeHelpersImport = `${useTypeImports ? 'import type' : 'import'} { Empty, Incremental } from './graphql${
    emitLegacyCommonJSImports ? '' : '.js'
  }';\n`;

  if (augmentedModuleName == null) {
    return [
      documentNodeImport,
      typeHelpersImport,
      `\n`,
      fragmentTypeHelper,
      `\n`,
      createUnmaskFunction(unmaskFunctionName),
      `\n`,
      makeFragmentDataHelper,
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
