import { PluginFunction } from '@graphql-codegen/plugin-helpers';
import { FragmentDefinitionNode, OperationDefinitionNode } from 'graphql';
import { Source } from '@graphql-tools/utils';
// import { operationName } from '@apollo/client';

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
  const [rawSDLTypeMap, registryLines] = getDocumentRegistryChunk(sourcesWithOperations);
  const overloadChunkLines = getGqlOverloadChunk(rawSDLTypeMap, sourcesWithOperations);
  return [
    `import * as graphql from './graphql';\n`,
    `${
      useTypeImports ? 'import type' : 'import'
    } { TypedDocumentNode as DocumentNode } from '@graphql-typed-document-node/core';\n`,
    `\n`,
    ...registryLines,
    `\n`,
    ...overloadChunkLines,
    `\n`,
    // `export function gql(source: string): unknown;\n`,
    `export function gql(source: string) {\n`,
    `  return (documents as any)[source.replace(/\\n|\\s/g, '')] ?? {};\n`,
    `}\n`,
    documentTypePartial,
  ].join(``);
};

function getDocumentRegistryChunk(sourcesWithOperations: Array<SourceWithOperations> = []) {
  const rawSDLTypeMap = new Map<string, string>();
  const addedOperations = new Set<string>();
  const typesLines = new Array<string>();
  const documentsLines = new Array<string>();
  documentsLines.push(`const documents = {\n`);

  for (const { operations, ...rest } of sourcesWithOperations) {
    const originalString = rest.source.rawSDL!;

    if (operations.length === 1) {
      const operation = operations[0];
      if (!addedOperations.has(operation.initialName)) {
        documentsLines.push(
          `    ${JSON.stringify(originalString.replace(/\n|\s/g, ''))}: graphql.${operation.initialName},\n`
        );
        addedOperations.add(operation.initialName);
      }
      rawSDLTypeMap.set(originalString, `typeof graphql.${operation.initialName}`);
    } else {
      const operationNames = operations.map(operation => operation.definition.name.value);
      const typeName = `${operationNames.join('')}Documents`;

      typesLines.push(
        `type ${typeName} = {\n${operations
          .map(operation => `  "${operation.definition.name.value}": typeof graphql.${operation.initialName}`)
          .join(',\n')}\n};\n\n`
      );
      documentsLines.push(`    ${JSON.stringify(originalString.replace(/\n|\s/g, ''))}: <${typeName}>{\n`);
      rawSDLTypeMap.set(originalString, typeName);
      for (const operation of operations) {
        if (!addedOperations.has(operation.initialName)) {
          documentsLines.push(`        "${operation.definition.name.value}": graphql.${operation.initialName},\n`);
          addedOperations.add(operation.initialName);
        }
      }
      documentsLines.push(`    },\n`);
    }
  }

  documentsLines.push(`};\n`);

  return [rawSDLTypeMap, [...typesLines, ...documentsLines]];
}

function getGqlOverloadChunk(rawSDLTypeMap, sourcesWithOperations: Array<SourceWithOperations>) {
  const lines = new Set<string>();

  // We intentionally don't use a <T extends keyof typeof documents> generic, because TS
  // would print very long `gql` function signatures (duplicating the source).
  for (const { operations, ...rest } of sourcesWithOperations) {
    const originalString = rest.source.rawSDL!;
    lines.add(
      `export function gql(source: ${JSON.stringify(`\n${originalString}\n`)}): ${rawSDLTypeMap.get(originalString)};\n`
    );
  }

  lines.add(`export function gql(source: string): ${[...rawSDLTypeMap.values()].join(' | ')} | unknown;\n`);
  return lines;
}
