import { Types, PluginFunction, getCachedDocumentNodeFromSchema } from '@graphql-codegen/plugin-helpers';
import { visit, GraphQLSchema } from 'graphql';
import { TypeGraphQLVisitor } from './visitor';
import { TsIntrospectionVisitor, includeIntrospectionDefinitions } from '@graphql-codegen/typescript';
import { TypeGraphQLPluginConfig } from './config';

export * from './visitor';

const TYPE_GRAPHQL_IMPORT = `import * as TypeGraphQL from 'type-graphql';\nexport { TypeGraphQL };`;
const isDefinitionInterface = (definition: string) => definition.includes('@TypeGraphQL.InterfaceType()');

export const plugin: PluginFunction<TypeGraphQLPluginConfig, Types.ComplexPluginOutput> = (
  schema: GraphQLSchema,
  documents: Types.DocumentFile[],
  config: TypeGraphQLPluginConfig
) => {
  const visitor = new TypeGraphQLVisitor(schema, config);
  const astNode = getCachedDocumentNodeFromSchema(schema);
  const visitorResult = visit(astNode, { leave: visitor });
  const introspectionDefinitions = includeIntrospectionDefinitions(schema, documents, config);
  const scalars = visitor.scalarsDefinition;

  const definitions = visitorResult.definitions;
  // Sort output by interfaces first, classes last to prevent TypeScript errors
  definitions.sort(
    (definition1, definition2) => +isDefinitionInterface(definition2) - +isDefinitionInterface(definition1)
  );

  return {
    prepend: [...visitor.getEnumsImports(), ...visitor.getWrapperDefinitions(), TYPE_GRAPHQL_IMPORT],
    content: [scalars, ...definitions, ...introspectionDefinitions].join('\n'),
  };
};

export { TsIntrospectionVisitor };
