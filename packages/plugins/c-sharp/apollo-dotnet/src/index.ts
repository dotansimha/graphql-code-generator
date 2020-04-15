import { Types, PluginValidateFn, PluginFunction } from '@graphql-codegen/plugin-helpers';
import { visit, GraphQLSchema, concatAST, Kind, FragmentDefinitionNode } from 'graphql';
import { LoadedFragment } from '@graphql-codegen/visitor-plugin-common';
import { ApolloDotNetVisitor } from './visitor';
import { extname } from 'path';
import gql from 'graphql-tag';
import { ApolloDotNetRawPluginConfig } from './config';

export const plugin: PluginFunction<ApolloDotNetRawPluginConfig> = (schema: GraphQLSchema, documents: Types.DocumentFile[], config) => {
  const openNameSpace = 'namespace GraphQLCodeGen {';
  const allAst = concatAST(documents.map(v => v.document));
  const allFragments: LoadedFragment[] = [
    ...(allAst.definitions.filter(d => d.kind === Kind.FRAGMENT_DEFINITION) as FragmentDefinitionNode[]).map(fragmentDef => ({ node: fragmentDef, name: fragmentDef.name.value, onType: fragmentDef.typeCondition.name.value, isExternal: false })),
    ...(config.externalFragments || []),
  ];

  const visitor = new ApolloDotNetVisitor(schema, allFragments, config, documents);
  const visitorResult = visit(allAst, { leave: visitor });
  return {
    prepend: [],
    content: [openNameSpace, visitor.fragments, ...visitorResult.definitions.filter(t => typeof t === 'string'), '}'].filter(a => a).join('\n'),
  };
};

export const addToSchema = gql`
  directive @NgModule(module: String!) on OBJECT | FIELD
  directive @namedClient(name: String!) on OBJECT | FIELD
`;

export const validate: PluginValidateFn<any> = async (schema: GraphQLSchema, documents: Types.DocumentFile[], config, outputFile: string) => {
  if (extname(outputFile) !== '.cs') {
    throw new Error(`Plugin "apollo-DotNet" requires extension to be ".cs"!`);
  }
};

export { ApolloDotNetVisitor };
