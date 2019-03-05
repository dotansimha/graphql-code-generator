import { DocumentFile, PluginValidateFn, PluginFunction } from 'graphql-codegen-core';
import { visit, GraphQLSchema, concatAST, Kind, FragmentDefinitionNode, OperationDefinitionNode } from 'graphql';
import { RawClientSideBasePluginConfig } from 'graphql-codegen-visitor-plugin-common';
import { ApolloAngularVisitor } from './visitor';
import { extname } from 'path';
import gql from 'graphql-tag';

export const plugin: PluginFunction<RawClientSideBasePluginConfig> = (
  schema: GraphQLSchema,
  documents: DocumentFile[],
  config: RawClientSideBasePluginConfig
) => {
  const allAst = concatAST(
    documents.reduce((prev, v) => {
      return [...prev, v.content];
    }, [])
  );
  const operations = allAst.definitions.filter(d => d.kind === Kind.OPERATION_DEFINITION) as OperationDefinitionNode[];

  if (operations.length === 0) {
    return '';
  }

  const allFragments = allAst.definitions.filter(d => d.kind === Kind.FRAGMENT_DEFINITION) as FragmentDefinitionNode[];
  const visitor = new ApolloAngularVisitor(allFragments, operations, config) as any;
  const visitorResult = visit(allAst, { leave: visitor });

  return [
    visitor.getImports(),
    visitor.fragments,
    ...visitorResult.definitions.filter(t => typeof t === 'string')
  ].join('\n');
};

export const addToSchema = gql`
  directive @NgModule(module: String!) on OBJECT | FIELD
  directive @namedClient(name: String!) on OBJECT | FIELD
`;

export const validate: PluginValidateFn<any> = async (
  schema: GraphQLSchema,
  documents: DocumentFile[],
  config: any,
  outputFile: string
) => {
  if (extname(outputFile) !== '.ts') {
    throw new Error(`Plugin "apollo-angular" requires extension to be ".ts"!`);
  }
};
