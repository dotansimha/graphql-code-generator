import { Types, PluginValidateFn, PluginFunction } from '@graphql-codegen/plugin-helpers';
import { visit, GraphQLSchema, concatAST, Kind, FragmentDefinitionNode } from 'graphql';
import { LoadedFragment } from '@graphql-codegen/visitor-plugin-common';
import { ReactApolloVisitor } from './visitor';
import { extname } from 'path';
import { ReactApolloRawPluginConfig } from './config';

export const plugin: PluginFunction<ReactApolloRawPluginConfig, Types.ComplexPluginOutput> = (
  schema: GraphQLSchema,
  documents: Types.DocumentFile[],
  config: ReactApolloRawPluginConfig
) => {
  const allAst = concatAST(documents.map(v => v.document));

  const allFragments: LoadedFragment[] = [
    ...(allAst.definitions.filter(d => d.kind === Kind.FRAGMENT_DEFINITION) as FragmentDefinitionNode[]).map(
      fragmentDef => ({
        node: fragmentDef,
        name: fragmentDef.name.value,
        onType: fragmentDef.typeCondition.name.value,
        isExternal: false,
      })
    ),
    ...(config.externalFragments || []),
  ];

  config.reactApolloVersion = config.reactApolloVersion || 3;
  if (config.reactApolloVersion === 3) {
    config.gqlImport = config.gqlImport || '@apollo/client';
  }
  const visitor = new ReactApolloVisitor(schema, allFragments, config, documents);
  const visitorResult = visit(allAst, { leave: visitor });

  return {
    prepend: visitor.getImports(),
    content: [visitor.fragments, ...visitorResult.definitions.filter(t => typeof t === 'string')].join('\n'),
  };
};

export const validate: PluginValidateFn<any> = async (
  schema: GraphQLSchema,
  documents: Types.DocumentFile[],
  config: ReactApolloRawPluginConfig,
  outputFile: string
) => {
  if (config.withComponent === false) {
    if (extname(outputFile) !== '.ts' && extname(outputFile) !== '.tsx') {
      throw new Error(`Plugin "react-apollo" with "noComponents" requires extension to be ".ts" or ".tsx"!`);
    }
  } else {
    if (extname(outputFile) !== '.tsx') {
      throw new Error(`Plugin "react-apollo" requires extension to be ".tsx"!`);
    }
  }
};

export { ReactApolloVisitor };
