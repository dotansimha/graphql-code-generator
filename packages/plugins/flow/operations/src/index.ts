import { oldVisit, PluginFunction, Types } from '@graphql-codegen/plugin-helpers';
import { concatAST, GraphQLSchema, Kind, FragmentDefinitionNode } from 'graphql';
import { FlowDocumentsVisitor } from './visitor.js';
import { LoadedFragment, optimizeOperations } from '@graphql-codegen/visitor-plugin-common';
import { FlowDocumentsPluginConfig } from './config.js';

export const plugin: PluginFunction<FlowDocumentsPluginConfig> = (
  schema: GraphQLSchema,
  rawDocuments: Types.DocumentFile[],
  config: FlowDocumentsPluginConfig
) => {
  const documents = config.flattenGeneratedTypes
    ? optimizeOperations(schema, rawDocuments, { includeFragments: true })
    : rawDocuments;

  const prefix = config.preResolveTypes
    ? ''
    : `type $Pick<Origin: Object, Keys: Object> = $ObjMapi<Keys, <Key>(k: Key) => $ElementType<Origin, Key>>;\n`;

  const allAst = concatAST(documents.map(v => v.document));
  const includedFragments = allAst.definitions.filter(d => d.kind === Kind.FRAGMENT_DEFINITION);

  const allFragments: LoadedFragment[] = [
    ...(includedFragments as FragmentDefinitionNode[]).map(fragmentDef => ({
      node: fragmentDef,
      name: fragmentDef.name.value,
      onType: fragmentDef.typeCondition.name.value,
      isExternal: false,
    })),
    ...(config.externalFragments || []),
  ];

  const visitor = new FlowDocumentsVisitor(schema, config, allFragments);

  const visitorResult = oldVisit(allAst, {
    leave: visitor,
  });

  return {
    prepend: ['// @flow\n', ...visitor.getImports()],
    content: [prefix, ...visitorResult.definitions].join('\n'),
  };
};
