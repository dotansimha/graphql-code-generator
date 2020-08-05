import { Types, PluginValidateFn, PluginFunction } from '@graphql-codegen/plugin-helpers';
import { visit, GraphQLSchema, concatAST, Kind, FragmentDefinitionNode } from 'graphql';
import { RawClientSideBasePluginConfig, LoadedFragment } from '@graphql-codegen/visitor-plugin-common';
import { OclifVisitor } from './visitor';
import { extname } from 'path';

export interface Config extends RawClientSideBasePluginConfig {
  handlerPath?: string;
}

export const plugin: PluginFunction<Config> = (
  schema: GraphQLSchema,
  documents: Types.DocumentFile[],
  config,
  info
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
  const visitor = new OclifVisitor(schema, allFragments, config, info);
  visit(allAst, { leave: visitor });

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

export { OclifVisitor };
