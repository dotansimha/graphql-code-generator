import { Types, PluginValidateFn, PluginFunction, oldVisit } from '@graphql-codegen/plugin-helpers';
import { GraphQLSchema, concatAST, Kind, FragmentDefinitionNode } from 'graphql';
import { RawClientSideBasePluginConfig, LoadedFragment } from '@graphql-codegen/visitor-plugin-common';
import { GraphQLRequestVisitor } from './visitor.js';
import { extname } from 'path';

export interface Config extends RawClientSideBasePluginConfig {
  handlerPath?: string;
}

export interface Info {
  outputFile: string;
  allPlugins: any[];
}

export const plugin: PluginFunction = (
  schema: GraphQLSchema,
  documents: Types.DocumentFile[],
  config: Config,
  info: Info
) => {
  const allAst = concatAST(
    documents.reduce((prev, v) => {
      return [...prev, v.document];
    }, [])
  );
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
  const visitor = new GraphQLRequestVisitor(schema, allFragments, config, info);
  oldVisit(allAst, { leave: visitor });

  return {
    prepend: visitor.getImports(),
    content: visitor.cliContent,
  };
};

export const validate: PluginValidateFn<any> = async (
  schema: GraphQLSchema,
  documents: Types.DocumentFile[],
  config: Config,
  outputFile: string
) => {
  if (extname(outputFile) !== '.ts') {
    throw new Error(`Plugin "typescript-oclif" requires output file extensions to be ".ts"!`);
  }
};

export { GraphQLRequestVisitor };
