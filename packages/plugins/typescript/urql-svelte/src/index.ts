import { Types, PluginValidateFn, PluginFunction } from '@graphql-codegen/plugin-helpers';
import { visit, GraphQLSchema, concatAST, Kind, FragmentDefinitionNode } from 'graphql';
import { LoadedFragment } from '@graphql-codegen/visitor-plugin-common';
import { UrqlVisitor } from './visitor';
import { extname } from 'path';
import { UrqlSvelteRawPluginConfig } from './config';

export const plugin: PluginFunction<UrqlSvelteRawPluginConfig, Types.ComplexPluginOutput> = (
  schema: GraphQLSchema,
  documents: Types.DocumentFile[],
  config: UrqlSvelteRawPluginConfig
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
  const visitor = new UrqlVisitor(schema, allFragments, config) as any;
  const visitorResult = visit(allAst, { leave: visitor });

  return {
    prepend: visitor.getImports(),
    content: [visitor.fragments, ...visitorResult.definitions.filter(t => typeof t === 'string')].join('\n'),
  };
};

export const validate: PluginValidateFn<any> = async (
  schema: GraphQLSchema,
  documents: Types.DocumentFile[],
  config: UrqlSvelteRawPluginConfig,
  outputFile: string
) => {
  // if (config.withComponent === true) {
  //   if (extname(outputFile) !== '.tsx') {
  //     throw new Error(`Plugin "typescript-urql" requires extension to be ".tsx" when withComponent: true is set!`);
  //   }
  // } else {
  //   if (extname(outputFile) !== '.ts' && extname(outputFile) !== '.tsx') {
  //     throw new Error(`Plugin "typescript-urql" requires extension to be ".ts" or ".tsx"!`);
  //   }
  // }
};

export { UrqlVisitor };
