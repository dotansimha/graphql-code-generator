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
`;

export const plugin: PluginFunction<{
  sourcesWithOperations: Array<SourceWithOperations>;
  useTypeImports?: boolean;
}> = (_, __, { sourcesWithOperations, useTypeImports }, _info) => {
  if (!sourcesWithOperations) {
    return '';
  }
  return [
    `import * as graphql from './graphql';\n`,
    `${
      useTypeImports ? 'import type' : 'import'
    } { TypedDocumentNode as DocumentNode } from '@graphql-typed-document-node/core';\n`,
    `\n`,
    ...getDocumentRegistryChunk(sourcesWithOperations),
    `\n`,
    ...getGqlOverloadChunk(sourcesWithOperations),
    `\n`,
    `export function gql(source: string): unknown;\n`,
    `export function gql(source: string) {\n`,
    `  return (documents as any)[source] ?? {};\n`,
    `}\n`,
    documentTypePartial,
  ].join(``);
};

function getDocumentRegistryChunk(sourcesWithOperations: Array<SourceWithOperations> = []) {
  const lines: Array<string> = [];
  lines.push(`const documents = {\n`);

  for (const { operations, ...rest } of sourcesWithOperations) {
    const originalString = rest.source.rawSDL!;
    const operation = operations[0];

    lines.push(`    ${JSON.stringify(originalString)}: graphql.${operation.initialName},\n`);
  }

  lines.push(`};\n`);

  return lines;
}

function getGqlOverloadChunk(sourcesWithOperations: Array<SourceWithOperations>) {
  const lines: Array<string> = [];

  // We intentionally don't use a <T extends keyof typeof documents> generic, because TS
  // would print very long `gql` function signatures (duplicating the source).
  for (const { operations, ...rest } of sourcesWithOperations) {
    const originalString = rest.source.rawSDL!;
    lines.push(
      `export function gql(source: ${JSON.stringify(originalString)}): (typeof documents)[${JSON.stringify(
        originalString
      )}];\n`
    );
  }

  return lines;
}
