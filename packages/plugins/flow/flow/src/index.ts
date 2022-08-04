import { Types, PluginFunction, getCachedDocumentNodeFromSchema, oldVisit } from '@graphql-codegen/plugin-helpers';
import { GraphQLSchema } from 'graphql';
import { FlowVisitor } from './visitor.js';
import { FlowPluginConfig } from './config.js';

export * from './visitor.js';
export * from './flow-variables-to-object.js';

export const plugin: PluginFunction<FlowPluginConfig, Types.ComplexPluginOutput> = (
  schema: GraphQLSchema,
  documents: Types.DocumentFile[],
  config: FlowPluginConfig
) => {
  const header = `// @flow\n`;
  const astNode = getCachedDocumentNodeFromSchema(schema);
  const visitor = new FlowVisitor(schema, config);

  const visitorResult = oldVisit(astNode, {
    leave: visitor,
  });

  return {
    prepend: [header, ...visitor.getEnumsImports()],
    content: [visitor.scalarsDefinition, ...visitorResult.definitions].join('\n'),
  };
};
