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

export const plugin: PluginFunction<{
  sourcesWithOperations: Array<SourceWithOperations>;
  useTypeImports?: boolean;
  augmentedModuleName?: string;
}> = (_, __, { sourcesWithOperations, useTypeImports, augmentedModuleName }, _info) => {
  if (!sourcesWithOperations) {
    return '';
  }

  if (augmentedModuleName == null) {
    return [
      `import * as graphql from './graphql.js';\n`,
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
        : `typeof import('./graphql.js').${operations[0].initialName}`;
    lines.add(`export function gql(source: ${JSON.stringify(originalString)}): ${returnType};\n`);
  }

  return lines;
}
