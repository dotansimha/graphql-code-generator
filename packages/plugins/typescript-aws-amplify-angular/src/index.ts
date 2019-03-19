import { Types, PluginValidateFn, PluginFunction } from '@graphql-codegen/plugin-helpers';
import { visit, GraphQLSchema, concatAST, Kind, FragmentDefinitionNode, OperationDefinitionNode } from 'graphql';
import { RawClientSideBasePluginConfig } from '@graphql-codegen/visitor-plugin-common';
import { AwsAmplifyAngularVisitor } from './visitor';
import { extname } from 'path';

export interface AwsAmplifyAngularRawPluginConfig extends RawClientSideBasePluginConfig {}

export const plugin: PluginFunction<AwsAmplifyAngularRawPluginConfig> = (
  schema: GraphQLSchema,
  documents: Types.DocumentFile[],
  config
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
  const visitor = new AwsAmplifyAngularVisitor(allFragments, operations, config);
  const visitorResult = visit(allAst, { leave: visitor });

  return [
    visitor.getImports(),
    visitor.fragments,
    ...visitorResult.definitions.filter(t => typeof t === 'string'),
    visitor.buildService()
  ].join('\n');
};

export const validate: PluginValidateFn<any> = async (
  schema: GraphQLSchema,
  documents: Types.DocumentFile[],
  config,
  outputFile: string
) => {
  if (extname(outputFile) !== '.ts') {
    throw new Error(`Plugin "typescript-aws-amplify-angular" requires extension to be ".ts"!`);
  }
};
