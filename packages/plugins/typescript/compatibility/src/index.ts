import { GraphQLSchema, concatAST, visit } from 'graphql';
import { PluginFunction, Types } from '@graphql-codegen/plugin-helpers';
import { CompatibilityPluginVisitor } from './visitor';
import { CompatibilityPluginRawConfig } from './config';

const REACT_APOLLO_PLUGIN_NAME = 'typescript-react-apollo';

export const plugin: PluginFunction<CompatibilityPluginRawConfig> = async (
  schema: GraphQLSchema,
  documents: Types.DocumentFile[],
  config: CompatibilityPluginRawConfig,
  additionalData
): Promise<string> => {
  const allAst = concatAST(documents.map(v => v.document));

  const reactApollo = ((additionalData || {}).allPlugins || []).find(
    p => Object.keys(p)[0] === REACT_APOLLO_PLUGIN_NAME
  );
  const visitor = new CompatibilityPluginVisitor(config, schema, {
    reactApollo: reactApollo
      ? {
          ...(config || {}),
          ...(reactApollo[REACT_APOLLO_PLUGIN_NAME] as object),
        }
      : null,
  });

  const visitorResult = visit(allAst, {
    leave: visitor as any,
  });

  const discriminateUnion = `type DiscriminateUnion<T, U> = T extends U ? T : never;\n`;
  const result: string = visitorResult.definitions.filter(a => a && typeof a === 'string').join('\n');

  return result.includes('DiscriminateUnion') ? [discriminateUnion, result].join('\n') : result;
};
