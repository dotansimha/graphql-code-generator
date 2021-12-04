import { Types, PluginFunction } from '@graphql-codegen/plugin-helpers';
import { GraphQLSchema } from 'graphql';
import { extractDeclared } from '@graphql-codegen/graphql-modules-preset';
import { Source } from '@graphql-tools/utils';

export const plugin: PluginFunction = (schema: GraphQLSchema, documents: Types.DocumentFile[], config: {}, info) => {
  const rootTypes = [
    schema.getQueryType()?.name,
    schema.getMutationType()?.name,
    schema.getSubscriptionType()?.name,
  ].filter(Boolean);

  if (!('sources' in schema.extensions)) {
    throw new Error(
      `Missing "extendedSources" information in GraphQL schema "extensions" field. Please make sure to load your schema from SDL sources!`
    );
  }

  const sources: Source[] = (schema.extensions?.extendedSources || []) as Source[];
  const mappedSubModules = sources.map(source => {
    const extracted = extractDeclared({ doc: source.document!, rootTypes });

    return {
      rawSDL: source.rawSDL,
      extracted,
    };
  });

  const rawMappingType = `type RawSdlToResolversMapping = {
${mappedSubModules.map(m => `  ${JSON.stringify(m.rawSDL)}: Resolvers;`).join('\n')}
};`;

  const typeHelpers = [
    'type SdlToResolversMapping = { [K in keyof RawSdlToResolversMapping as Trim<K>]: Resolvers; };',
    `type Whitespace = '\\n' | ' ';`,
    'type Trim<T> = T extends `${Whitespace}${infer U}` ? Trim<U> : T extends `${infer U}${Whitespace}` ? Trim<U> : T extends `${infer A}\\n  ${infer B}` ? Trim<`${A}\\n${B}`> : T extends `${infer A}    ${infer B}` ? Trim<`${A}  ${B}`>: T;',
    'interface TsqlDocumentNode<T> extends DocumentNode { $__type: T; }',
    'export type ResolversOf<T> = T extends TsqlDocumentNode<infer R> ? R : never;',
  ];

  const fn = `
export function typeDefs<TDocumentString extends string>(
  source: TDocumentString
): Trim<TDocumentString> extends keyof SdlToResolversMapping
  ? TsqlDocumentNode<SdlToResolversMapping[Trim<TDocumentString>]>
  : never {
  return parse(source) as any;
}
`;

  return {
    prepend: [`import { DocumentNode, parse } from 'graphql';`],
    content: [rawMappingType, ...typeHelpers, fn].join('\n'),
  };
};
