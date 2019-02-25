import { DocumentFile, PluginFunction } from 'graphql-codegen-core';
import { parse, printSchema, visit, GraphQLSchema } from 'graphql';
import { ScalarsMap, EnumValuesMap } from 'graphql-codegen-visitor-plugin-common';
import { TsVisitor } from './visitor';

export interface TypeScriptPluginConfig {
  scalars?: ScalarsMap;
  enumValues?: EnumValuesMap;
  namingConvention?: string;
  typesPrefix?: string;
}

export const plugin: PluginFunction<TypeScriptPluginConfig> = (
  schema: GraphQLSchema,
  documents: DocumentFile[],
  config: TypeScriptPluginConfig
) => {
  const printedSchema = printSchema(schema);
  const astNode = parse(printedSchema);

  const visitorResult = visit(astNode, {
    leave: new TsVisitor(config) as any
  });

  return visitorResult.definitions.join('\n');
};
