import { PluginFunction, GraphQLSchema, DocumentFile } from 'graphql-codegen-core';
import { visit, concatAST } from 'graphql';
import { FlowCommonPluginConfig, FlowCommonVisitor } from './visitor';

export type ScalarsMap = { [name: string]: string };
export type EnumValuesMap = { [key: string]: string };

export const plugin: PluginFunction<FlowCommonPluginConfig> = (
  schema: GraphQLSchema,
  documents: DocumentFile[],
  config: FlowCommonPluginConfig
) => {
  let result = `// @flow\n\n`;
  const allTypes = Object.values(schema.getTypeMap())
    .filter(type => type.astNode)
    .map(type => type.astNode);
  const visitorResult = allTypes.map(astNode =>
    visit(astNode, {
      leave: new FlowCommonVisitor(config)
    })
  );

  return result + visitorResult.join('\n');
};

export { DEFAULT_SCALARS } from './visitor';
export * from './utils';
