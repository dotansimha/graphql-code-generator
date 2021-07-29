import { Types, PluginFunction } from '@graphql-codegen/plugin-helpers';
import { GraphQLSchema } from 'graphql';

export const plugin: PluginFunction = (schema: GraphQLSchema, documents: Types.DocumentFile[], config: {}, info) => {
  const moduleDeclaration = `declare module 'tsgql' {
  import { DocumentNode, parse } from 'graphql';
  export type Resolvers = {};

  export function typeDefs<TDocumentString extends string>(sources: TDocumentString): Resolvers {
    return parse(sources);
  }
}
`;

  return {
    prepend: [],
    content: [moduleDeclaration].join('\n'),
  };
};
