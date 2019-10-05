import { Types, PluginValidateFn, PluginFunction } from '@graphql-codegen/plugin-helpers';
import { visit, GraphQLSchema, concatAST, Kind, FragmentDefinitionNode } from 'graphql';
import { RawClientSideBasePluginConfig, LoadedFragment } from '@graphql-codegen/visitor-plugin-common';
import { GraphQLRequestVisitor } from './visitor';
import { extname } from 'path';

export interface GraphQLRequestPluginRawConfig extends RawClientSideBasePluginConfig {}

export const plugin: PluginFunction<GraphQLRequestPluginRawConfig> = (schema: GraphQLSchema, documents: Types.DocumentFile[], config: GraphQLRequestPluginRawConfig) => {
  const allAst = concatAST(
    documents.reduce((prev, v) => {
      return [...prev, v.content];
    }, [])
  );
  const allFragments: LoadedFragment[] = [
    ...(allAst.definitions.filter(d => d.kind === Kind.FRAGMENT_DEFINITION) as FragmentDefinitionNode[]).map(fragmentDef => ({ node: fragmentDef, name: fragmentDef.name.value, onType: fragmentDef.typeCondition.name.value, isExternal: false })),
    ...(config.externalFragments || []),
  ];
  const visitor = new GraphQLRequestVisitor(schema, allFragments, config);
  const visitorResult = visit(allAst, { leave: visitor });

  return {
    prepend: visitor.getImports(),
    content: [visitor.fragments, ...visitorResult.definitions.filter(t => typeof t === 'string'), visitor.sdkContent].join('\n'),
  };
};

export const validate: PluginValidateFn<any> = async (schema: GraphQLSchema, documents: Types.DocumentFile[], config: GraphQLRequestPluginRawConfig, outputFile: string) => {
  if (extname(outputFile) !== '.ts') {
    throw new Error(`Plugin "typescript-graphql-request" requires extension to be ".ts"!`);
  }
};

export { GraphQLRequestVisitor };
