import { PluginFunction } from '@graphql-codegen/plugin-helpers';
import { DocumentMode } from '@graphql-codegen/visitor-plugin-common';
import { Source } from '@graphql-tools/utils';
import { FragmentDefinitionNode, OperationDefinitionNode } from 'graphql';

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
  gqlTagName?: string;
  emitLegacyCommonJSImports?: boolean;
  documentMode?: DocumentMode;
}> = (
  _,
  __,
  {
    sourcesWithOperations,
    useTypeImports,
    augmentedModuleName,
    gqlTagName = 'gql',
    emitLegacyCommonJSImports,
    documentMode,
  },
  _info
) => {
  if (documentMode === DocumentMode.string) {
    const code = [`import * as types from './graphql${emitLegacyCommonJSImports ? '' : '.js'}';\n`, `\n`];

    // We need the mapping from source as written to full document source to
    // handle fragments. An identity function would not suffice.
    if (sourcesWithOperations.length > 0) {
      code.push([...getDocumentRegistryChunk(sourcesWithOperations)].join(''));
    } else {
      code.push('const documents = {}');
    }

    if (sourcesWithOperations.length > 0) {
      code.push(
        [...getGqlOverloadChunk(sourcesWithOperations, gqlTagName, 'augmented', emitLegacyCommonJSImports), `\n`].join(
          ''
        )
      );
    }

    code.push(
      [`export function ${gqlTagName}(source: string) {\n`, `  return (documents as any)[source] ?? {};\n`, `}\n`].join(
        ''
      )
    );

    return code.join('\n');
  }

  if (augmentedModuleName == null) {
    const code = [
      `import * as types from './graphql${emitLegacyCommonJSImports ? '' : '.js'}';\n`,
      `${
        useTypeImports ? 'import type' : 'import'
      } { TypedDocumentNode as DocumentNode } from '@graphql-typed-document-node/core';\n`,
      `\n`,
    ];

    if (sourcesWithOperations.length > 0) {
      code.push([...getDocumentRegistryChunk(sourcesWithOperations)].join(''));
    } else {
      code.push('const documents = [];');
    }

    code.push(
      [
        `\n`,
        `/**\n * The ${gqlTagName} function is used to parse GraphQL queries into a document that can be used by GraphQL clients.\n *\n`,
        ` *\n * @example\n`,
        ' * ```ts\n',
        ` * const query = ${gqlTagName}` + '(`query GetUser($id: ID!) { user(id: $id) { name } }`);\n',
        ' * ```\n *\n',
        ` * The query argument is unknown!\n`,
        ` * Please regenerate the types.\n`,
        ` */\n`,
        `export function ${gqlTagName}(source: string): unknown;\n`,
        `\n`,
      ].join('')
    );

    if (sourcesWithOperations.length > 0) {
      code.push(
        [...getGqlOverloadChunk(sourcesWithOperations, gqlTagName, 'lookup', emitLegacyCommonJSImports), `\n`].join('')
      );
    }

    code.push(
      [
        `export function ${gqlTagName}(source: string) {\n`,
        `  return (documents as any)[source] ?? {};\n`,
        `}\n`,
        `\n`,
        ...documentTypePartial,
      ].join('')
    );

    return code.join('');
  }

  return [
    `import { TypedDocumentNode as DocumentNode } from '@graphql-typed-document-node/core';\n`,
    `declare module "${augmentedModuleName}" {`,
    [
      `\n`,
      ...(sourcesWithOperations.length > 0
        ? getGqlOverloadChunk(sourcesWithOperations, gqlTagName, 'augmented', emitLegacyCommonJSImports)
        : []),
      `export function ${gqlTagName}(source: string): unknown;\n`,
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
  lines.add(
    `/**\n * Map of all GraphQL operations in the project.\n *\n * This map has several performance disadvantages:\n`
  );
  lines.add(` * 1. It is not tree-shakeable, so it will include all operations in the project.\n`);
  lines.add(` * 2. It is not minifiable, so the string of a GraphQL query will be multiple times inside the bundle.\n`);
  lines.add(` * 3. It does not support dead code elimination, so it will add unused operations.\n *\n`);
  lines.add(` * Therefore it is highly recommended to use the babel or swc plugin for production.\n`);
  lines.add(
    ` * Learn more about it here: https://the-guild.dev/graphql/codegen/plugins/presets/preset-client#reducing-bundle-size\n */\n`
  );
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
    lines.add(
      `/**\n * The ${gqlTagName} function is used to parse GraphQL queries into a document that can be used by GraphQL clients.\n */\n` +
        `export function ${gqlTagName}(source: ${JSON.stringify(originalString)}): ${returnType};\n`
    );
  }

  return lines;
}
