import { Types, PluginValidateFn, PluginFunction } from '@graphql-codegen/plugin-helpers';
import { visit, GraphQLSchema, concatAST, Kind, FragmentDefinitionNode } from 'graphql';
import { RawClientSideBasePluginConfig } from '@graphql-codegen/visitor-plugin-common';
import { ReactApolloVisitor } from './visitor';
import { extname } from 'path';

export interface ReactApolloRawPluginConfig extends RawClientSideBasePluginConfig {
  withHOC?: boolean;
  withComponent?: boolean;
  withHooks?: boolean;
  hooksImportFrom?: string;
  gqlImport?: string;
  noGraphQLTag?: boolean;
}

export const plugin: PluginFunction<ReactApolloRawPluginConfig> = (schema: GraphQLSchema, documents: Types.DocumentFile[], config: ReactApolloRawPluginConfig) => {
  const allAst = concatAST(
    documents.reduce((prev, v) => {
      return [...prev, v.content];
    }, [])
  );
  const operationsCount = allAst.definitions.filter(d => d.kind === Kind.OPERATION_DEFINITION);

  if (operationsCount.length === 0) {
    return '';
  }

  const allFragments = allAst.definitions.filter(d => d.kind === Kind.FRAGMENT_DEFINITION) as FragmentDefinitionNode[];
  const visitor = new ReactApolloVisitor(allFragments, config) as any;
  const visitorResult = visit(allAst, { leave: visitor });

  return [visitor.getImports(), visitor.fragments, ...visitorResult.definitions.filter(t => typeof t === 'string')].join('\n');
};

export const validate: PluginValidateFn<any> = async (schema: GraphQLSchema, documents: Types.DocumentFile[], config: ReactApolloRawPluginConfig, outputFile: string) => {
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
