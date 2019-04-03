import { GraphQLSchema, concatAST, visit } from 'graphql';
import { PluginFunction, Types } from '@graphql-codegen/plugin-helpers';
import { RawConfig } from '@graphql-codegen/visitor-plugin-common';
import { CompatabilityPluginVisitor } from './visitor';

export interface CompatabilityPluginRawConfig extends RawConfig {}

export const plugin: PluginFunction<CompatabilityPluginRawConfig> = async (schema: GraphQLSchema, documents: Types.DocumentFile[], config: CompatabilityPluginRawConfig): Promise<string> => {
  const allAst = concatAST(
    documents.reduce((prev, v) => {
      return [...prev, v.content];
    }, [])
  );

  const visitor = new CompatabilityPluginVisitor(config, schema);

  const visitorResult = visit(allAst, {
    leave: visitor as any,
  });

  return visitorResult.definitions.filter(a => a && typeof a === 'string').join('\n');
};
