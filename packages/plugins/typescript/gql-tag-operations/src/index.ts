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
  gqlTagName?: string;
  emitLegacyCommonJSImports?: boolean;
}> = (_, __, { sourcesWithOperations, useTypeImports, gqlTagName = 'gql', emitLegacyCommonJSImports }, _info) => {
  if (!sourcesWithOperations) {
    return '';
  }

  return [
    `import * as types from './graphql${emitLegacyCommonJSImports ? '' : '.js'}';\n`,
    `${
      useTypeImports ? 'import type' : 'import'
    } { TypedDocumentNode as DocumentNode } from '@graphql-typed-document-node/core';\n`,
    `\n`,
    ...getDocumentRegistryChunk(sourcesWithOperations),
    `\n`,
    ...getGqlOverloadChunk(sourcesWithOperations, gqlTagName, 'lookup', emitLegacyCommonJSImports),
    `\n`,
    `export function ${gqlTagName}(source: string): unknown;\n`,
    `export function ${gqlTagName}(source: string) {\n`,
    `  return (documents as any)[source] ?? {};\n`,
    `}\n`,
    `\n`,
    ...documentTypePartial,
  ].join(``);
};

function getDocumentRegistryChunk(sourcesWithOperations: Array<SourceWithOperations> = []) {
  const lines = new Set<string>();
  lines.add(`const documents = {\n`);

  for (const { operations, ...rest } of sourcesWithOperations) {
    const originalString = rest.source.rawSDL!;
    const operation = operations[0];

    lines.add(`    ${JSON.stringify(originalString)}: types.${operation.initialName},\n`);
  }

  lines.add(`};\n`);

  return lines;
}

type Mode = 'lookup' | 'augmented';

function getGqlOverloadChunk(
  sourcesWithOperations: Array<SourceWithOperations>,
  gqlTagName: string,
  mode: Mode,
  emitLegacyCommonJSImports?: boolean
) {
  const lines = new Set<string>();

  // We intentionally don't use a <T extends keyof typeof documents> generic, because TS
  // would print very long `gql` function signatures (duplicating the source).
  for (const { operations, ...rest } of sourcesWithOperations) {
    const originalString = rest.source.rawSDL!;
    const returnType =
      mode === 'lookup'
        ? `(typeof documents)[${JSON.stringify(originalString)}]`
        : emitLegacyCommonJSImports
        ? `typeof import('./graphql').${operations[0].initialName}`
        : `typeof import('./graphql.js').${operations[0].initialName}`;
    lines.add(`export function ${gqlTagName}(source: ${JSON.stringify(originalString)}): ${returnType};\n`);
  }

  return lines;
}
