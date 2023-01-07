import { extname } from 'path';
import { oldVisit, PluginFunction, PluginValidateFn, Types } from '@graphql-codegen/plugin-helpers';
import {
  DocumentMode,
  LoadedFragment,
  optimizeOperations,
  RawClientSideBasePluginConfig,
} from '@graphql-codegen/visitor-plugin-common';
import { concatAST, FragmentDefinitionNode, GraphQLSchema, Kind } from 'graphql';
import { TypeScriptTypedDocumentNodesConfig } from './config.js';
import { TypeScriptDocumentNodesVisitor } from './visitor.js';

export const plugin: PluginFunction<TypeScriptTypedDocumentNodesConfig> = (
  schema: GraphQLSchema,
  rawDocuments: Types.DocumentFile[],
  config: TypeScriptTypedDocumentNodesConfig
) => {
  const documents = config.flattenGeneratedTypes ? optimizeOperations(schema, rawDocuments) : rawDocuments;
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

  const visitor = new TypeScriptDocumentNodesVisitor(schema, allFragments, config, documents);
  const visitorResult = oldVisit(allAst, { leave: visitor });

  return {
    prepend: allAst.definitions.length === 0 ? [] : visitor.getImports(),
    content: [visitor.fragments, ...visitorResult.definitions.filter(t => typeof t === 'string')].join('\n'),
  };
};

export const validate: PluginValidateFn<RawClientSideBasePluginConfig> = async (
  schema: GraphQLSchema,
  documents: Types.DocumentFile[],
  config,
  outputFile: string
) => {
  if (config && config.documentMode === DocumentMode.string) {
    throw new Error(`Plugin "typed-document-node" does not allow using 'documentMode: string' configuration!`);
  }

  if (extname(outputFile) !== '.ts' && extname(outputFile) !== '.tsx') {
    throw new Error(`Plugin "typed-document-node" requires extension to be ".ts" or ".tsx"!`);
  }
};

export { TypeScriptTypedDocumentNodesConfig };
