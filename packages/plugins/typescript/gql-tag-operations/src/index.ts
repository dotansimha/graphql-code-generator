import { PluginFunction } from '@graphql-codegen/plugin-helpers';
import { FragmentDefinitionNode, OperationDefinitionNode } from 'graphql';
import { Source } from '@graphql-tools/utils';

export type OperationOrFragment = {
  initialName: string;
  definition: OperationDefinitionNode | FragmentDefinitionNode;
};

export type SourceWithOperations = {
  source: Source;
  operations: Array<OperationOrFragment>;
};

const documentTypePartial = `
export type DocumentType<TDocumentNode extends DocumentNode<any, any>> = TDocumentNode extends DocumentNode<
  infer TType,
  any
>
  ? TType
  : never;
`.split(`\n`);

const maskingTypePartial = `
export type FragmentType<TDocumentType extends DocumentNode<any, any>> = TDocumentType extends DocumentNode<
  infer TType,
  any
>
  ? TType extends { ' $fragmentName': infer TKey }
    ? TKey extends string
      ? { ' $fragmentRefs': { [key in TKey]: TType } }
      : never
    : never
  : never;

export const useFragment = <TType>(
  _documentNode: DocumentNode<TType, any>,
  fragmentType: FragmentType<DocumentNode<TType, any>>
): TType => {
  return fragmentType as any;
};
`;

export const plugin: PluginFunction<{
  inlineFragmentTypes?: string;
  sourcesWithOperations: Array<SourceWithOperations>;
  useTypeImports?: boolean;
  augmentedModuleName?: string;
}> = (_, __, { sourcesWithOperations, useTypeImports, augmentedModuleName, inlineFragmentTypes }, _info) => {
  if (!sourcesWithOperations) {
    return '';
  }

  const maskingPartials: Array<string> = [];

  if (inlineFragmentTypes === 'mask') {
    maskingPartials.push(`\n`, maskingTypePartial);
  }

  if (augmentedModuleName == null) {
    return [
      `import * as graphql from './graphql';\n`,
      `${
        useTypeImports ? 'import type' : 'import'
      } { TypedDocumentNode as DocumentNode } from '@graphql-typed-document-node/core';\n`,
      `\n`,
      ...getDocumentRegistryChunk(sourcesWithOperations),
      `\n`,
      ...getGqlOverloadChunk(sourcesWithOperations, 'lookup'),
      `\n`,
      `export function gql(source: string): unknown;\n`,
      `export function gql(source: string) {\n`,
      `  return (documents as any)[source] ?? {};\n`,
      `}\n`,
      `\n`,
      ...documentTypePartial,
      ...maskingPartials,
    ].join(``);
  }

  return [
    `import { TypedDocumentNode as DocumentNode } from '@graphql-typed-document-node/core';\n`,
    `declare module "${augmentedModuleName}" {`,
    [
      `\n`,
      ...getGqlOverloadChunk(sourcesWithOperations, 'augmented'),
      `export function gql(source: string): unknown;\n`,
      `\n`,
      ...documentTypePartial,
    ]
      .map(line => (line === `\n` ? line : `  ${line}`))
      .join(``),
    `}`,
    ...maskingPartials,
  ].join(`\n`);
};

function getDocumentRegistryChunk(sourcesWithOperations: Array<SourceWithOperations> = []) {
  const lines = new Set<string>();
  lines.add(`const documents = {\n`);

  for (const { operations, ...rest } of sourcesWithOperations) {
    const originalString = rest.source.rawSDL!;
    const operation = operations[0];

    lines.add(`    ${JSON.stringify(originalString)}: graphql.${operation.initialName},\n`);
  }

  lines.add(`};\n`);

  return lines;
}

type Mode = 'lookup' | 'augmented';

function getGqlOverloadChunk(sourcesWithOperations: Array<SourceWithOperations>, mode: Mode) {
  const lines = new Set<string>();

  // We intentionally don't use a <T extends keyof typeof documents> generic, because TS
  // would print very long `gql` function signatures (duplicating the source).
  for (const { operations, ...rest } of sourcesWithOperations) {
    const originalString = rest.source.rawSDL!;
    const returnType =
      mode === 'lookup'
        ? `(typeof documents)[${JSON.stringify(originalString)}]`
        : `typeof import('./graphql').${operations[0].initialName}`;
    lines.add(`export function gql(source: ${JSON.stringify(originalString)}): ${returnType};\n`);
  }

  return lines;
}
