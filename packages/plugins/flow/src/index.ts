import { PluginFunction, GraphQLSchema, DocumentFile } from 'graphql-codegen-core';
import { visit } from 'graphql';
import { FlowPluginConfig, FlowVisitor } from './visitor';
export { DEFAULT_SCALARS } from './visitor';
export * from './utils';
export * from './variables-to-object';
export * from './visitor';

export type ScalarsMap = { [name: string]: string };
export type EnumValuesMap = { [key: string]: string };

export const plugin: PluginFunction<FlowPluginConfig> = (
  schema: GraphQLSchema,
  documents: DocumentFile[],
  config: FlowPluginConfig
) => {
  const result = `/* @flow */\n\n`;
  const allTypes = Object.values(schema.getTypeMap())
    .filter(type => type.astNode)
    .map(type => type.astNode);
  const visitorResult = allTypes.map(astNode =>
    visit(astNode, {
      leave: new FlowVisitor(config)
    })
  );

  return result + visitorResult.join('\n');
};
