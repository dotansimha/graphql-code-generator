import { GraphQLSchema, concatAST, visit } from 'graphql';
import { PluginFunction, Types } from '@graphql-codegen/plugin-helpers';
import { RawConfig } from '@graphql-codegen/visitor-plugin-common';
import { CompatabilityPluginVisitor } from './visitor';

export interface CompatabilityPluginRawConfig extends RawConfig {}

const REACT_APOLLO_PLUGIN_NAME = 'typescript-react-apollo';

export const plugin: PluginFunction<CompatabilityPluginRawConfig> = async (schema: GraphQLSchema, documents: Types.DocumentFile[], config: CompatabilityPluginRawConfig, additionalData): Promise<string> => {
  const allAst = concatAST(
    documents.reduce((prev, v) => {
      return [...prev, v.content];
    }, [])
  );

  const reactApollo = ((additionalData || {}).allPlugins || []).find(p => Object.keys(p)[0] === REACT_APOLLO_PLUGIN_NAME);
  const visitor = new CompatabilityPluginVisitor(config, schema, { reactApollo });

  const visitorResult = visit(allAst, {
    leave: visitor as any,
  });

  return visitorResult.definitions.filter(a => a && typeof a === 'string').join('\n');
};
