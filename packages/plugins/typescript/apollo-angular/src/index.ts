import { Types, PluginValidateFn, PluginFunction, oldVisit } from '@graphql-codegen/plugin-helpers';
import { GraphQLSchema, concatAST, Kind, FragmentDefinitionNode, OperationDefinitionNode, parse } from 'graphql';
import { LoadedFragment } from '@graphql-codegen/visitor-plugin-common';
import { ApolloAngularVisitor } from './visitor.js';
import { extname } from 'path';
import { ApolloAngularRawPluginConfig } from './config.js';

export const plugin: PluginFunction<ApolloAngularRawPluginConfig> = (
  schema: GraphQLSchema,
  documents: Types.DocumentFile[],
  config
) => {
  const allAst = concatAST(documents.map(v => v.document));
  const operations = allAst.definitions.filter(d => d.kind === Kind.OPERATION_DEFINITION) as OperationDefinitionNode[];
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

  const visitor = new ApolloAngularVisitor(schema, allFragments, operations, config, documents);
  const visitorResult = oldVisit(allAst, { leave: visitor });

  return {
    prepend: visitor.getImports(),
    content: [
      visitor.fragments,
      ...visitorResult.definitions.filter(t => typeof t === 'string'),
      config.sdkClass ? visitor.sdkClass : null,
    ]
      .filter(a => a)
      .join('\n'),
  };
};

export const addToSchema = parse(`
  directive @NgModule(module: String!) on OBJECT | FIELD
  directive @namedClient(name: String!) on OBJECT | FIELD
`);

export const validate: PluginValidateFn<any> = async (
  schema: GraphQLSchema,
  documents: Types.DocumentFile[],
  config,
  outputFile: string
) => {
  if (extname(outputFile) !== '.ts') {
    throw new Error(`Plugin "apollo-angular" requires extension to be ".ts"!`);
  }
};

export { ApolloAngularVisitor };
