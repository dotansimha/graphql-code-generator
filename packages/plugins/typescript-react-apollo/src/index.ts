import { DocumentFile, PluginFunction } from 'graphql-codegen-core';
import { parse, printSchema, visit, GraphQLSchema, concatAST, Kind, FragmentDefinitionNode } from 'graphql';
import { RawConfig } from 'graphql-codegen-visitor-plugin-common';
import { ReactApolloVisitor } from './visitor';
import { PluginValidateFn } from '../../../graphql-codegen-core/src/yml-config-types';
import { extname } from 'path';

export interface ReactApolloRawPluginConfig extends RawConfig {
  noHOC?: boolean;
  noComponents?: boolean;
  withHooks?: boolean;
  hooksImportFrom?: string;
  gqlImport?: string;
}

export const plugin: PluginFunction<ReactApolloRawPluginConfig> = (
  schema: GraphQLSchema,
  documents: DocumentFile[],
  config: ReactApolloRawPluginConfig
) => {
  const allAst = concatAST(
    documents.reduce((prev, v) => {
      return [...prev, v.content];
    }, [])
  );
  const allFragments = allAst.definitions.filter(d => d.kind === Kind.FRAGMENT_DEFINITION) as FragmentDefinitionNode[];
  const visitor = new ReactApolloVisitor(schema, allFragments, config) as any;
  const visitorResult = visit(allAst, { leave: visitor });

  return [visitor.imports, visitor.fragments, ...visitorResult.definitions.filter(t => typeof t === 'string')].join(
    '\n'
  );
};

export const validate: PluginValidateFn<any> = async (
  schema: GraphQLSchema,
  documents: DocumentFile[],
  config: ReactApolloRawPluginConfig,
  outputFile: string
) => {
  if (config.noComponents) {
    if (extname(outputFile) !== '.ts' && extname(outputFile) !== '.tsx') {
      throw new Error(`Plugin "react-apollo" with "noComponents" requires extension to be ".ts" or ".tsx"!`);
    }
  } else {
    if (extname(outputFile) !== '.tsx') {
      throw new Error(`Plugin "react-apollo" requires extension to be ".tsx"!`);
    }
  }
};
