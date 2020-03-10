import { PluginFunction, Types } from '@graphql-codegen/plugin-helpers';
import { visit, concatAST, GraphQLSchema, Kind, FragmentDefinitionNode } from 'graphql';
import { FlowDocumentsVisitor } from './visitor';
import { LoadedFragment, optimizeOperations } from '@graphql-codegen/visitor-plugin-common';
import { FlowDocumentsPluginConfig } from './config';

export const plugin: PluginFunction<FlowDocumentsPluginConfig> = (schema: GraphQLSchema, rawDocuments: Types.DocumentFile[], config: FlowDocumentsPluginConfig) => {
  const documents = config.flattenGeneratedTypes ? optimizeOperations(schema, rawDocuments) : rawDocuments;
  const prefix = `type $Pick<Origin: Object, Keys: Object> = $ObjMapi<Keys, <Key>(k: Key) => $ElementType<Origin, Key>>;\n`;

  const allAst = concatAST(documents.map(v => v.document));

  const allFragments: LoadedFragment[] = [
    ...(allAst.definitions.filter(d => d.kind === Kind.FRAGMENT_DEFINITION) as FragmentDefinitionNode[]).map(fragmentDef => ({ node: fragmentDef, name: fragmentDef.name.value, onType: fragmentDef.typeCondition.name.value, isExternal: false })),
    ...(config.externalFragments || []),
  ];

  const visitorResult = visit(allAst, {
    leave: new FlowDocumentsVisitor(schema, config, allFragments),
  });

  return [prefix, ...visitorResult.definitions].join('\n');
};
