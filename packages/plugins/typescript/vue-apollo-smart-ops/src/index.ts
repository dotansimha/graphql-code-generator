import { extname } from 'path';
import { Types, PluginValidateFn, PluginFunction, oldVisit } from '@graphql-codegen/plugin-helpers';
import { GraphQLSchema, concatAST, Kind, FragmentDefinitionNode } from 'graphql';
import { LoadedFragment } from '@graphql-codegen/visitor-plugin-common';
import { VueApolloVisitor } from './visitor.js';
import { VueApolloSmartOpsRawPluginConfig } from './config.js';

export const plugin: PluginFunction<VueApolloSmartOpsRawPluginConfig, Types.ComplexPluginOutput> = (
  schema: GraphQLSchema,
  documents: Types.DocumentFile[],
  config: VueApolloSmartOpsRawPluginConfig
) => {
  const allAst = concatAST(documents.map(s => s.document!));

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

  const visitor = new VueApolloVisitor(schema, allFragments, config, documents);
  const visitorResult = oldVisit(allAst, { leave: visitor });

  return {
    prepend: visitor.getImports(),
    content: [
      visitor.fragments,
      ...visitorResult.definitions.filter((definition: unknown) => typeof definition === 'string'),
    ].join('\n'),
  };
};

export const validate: PluginValidateFn<any> = (
  _schema: GraphQLSchema,
  _documents: Types.DocumentFile[],
  _config: VueApolloSmartOpsRawPluginConfig,
  outputFile: string
) => {
  if (extname(outputFile) !== '.ts' && extname(outputFile) !== '.tsx') {
    throw new Error(`Plugin "typescript-vue-apollo-smart-ops" requires extension to be ".ts" or ".tsx"!`);
  }
};

export { VueApolloVisitor };
