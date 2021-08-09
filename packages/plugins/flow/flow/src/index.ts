import { Types, PluginFunction, getCachedDocumentNodeFromSchema } from '@graphql-codegen/plugin-helpers';
import { visit, GraphQLSchema } from 'graphql';
import { FlowVisitor } from './visitor';
import { FlowPluginConfig } from './config';

export * from './visitor';
export * from './flow-variables-to-object';

export const plugin: PluginFunction<FlowPluginConfig, Types.ComplexPluginOutput> = (
  schema: GraphQLSchema,
  documents: Types.DocumentFile[],
  config: FlowPluginConfig
) => {
  const header = `// @flow\n`;
  const astNode = getCachedDocumentNodeFromSchema(schema);
  const visitor = new FlowVisitor(schema, config);

  const visitorResult = visit(astNode, {
    leave: visitor,
  });

  return {
    prepend: [header, ...visitor.getEnumsImports()],
    content: [visitor.scalarsDefinition, ...visitorResult.definitions].join('\n'),
  };
};
