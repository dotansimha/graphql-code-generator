import { PluginFunction, Types } from "@graphql-codegen/plugin-helpers";
import { GraphQLSchema, printSchema } from "graphql";

export const plugin: PluginFunction<{}, Types.ComplexPluginOutput> = (
    schema: GraphQLSchema,
    documents: Types.DocumentFile[],
    config: {}
) => {

  const prepend: string[] = [];
  prepend.push(`import gql from 'graphql-tag';`);

  const content: string = [
    'export const typeDefs = gql`',
    printSchema(schema),
    '`;',
  ].join('\n')

  return {
    prepend,
    content
  };
};
