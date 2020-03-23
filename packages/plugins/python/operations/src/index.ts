import { PluginFunction, Types } from '@graphql-codegen/plugin-helpers';
import { visit, concatAST, GraphQLSchema, Kind, FragmentDefinitionNode } from 'graphql';
import { PythonDocumentsVisitor } from './visitor';
import { LoadedFragment, optimizeOperations } from '@graphql-codegen/visitor-plugin-common';
import { PythonDocumentsPluginConfig } from './config';

export const plugin: PluginFunction<PythonDocumentsPluginConfig> = (
  schema: GraphQLSchema,
  rawDocuments: Types.DocumentFile[],
  config: PythonDocumentsPluginConfig
) => {
  const documents = config.flattenGeneratedTypes ? optimizeOperations(schema, rawDocuments) : rawDocuments;
  const allAst = concatAST(documents.map((v) => v.document));

  const allFragments: LoadedFragment[] = [
    ...(allAst.definitions.filter((d) => d.kind === Kind.FRAGMENT_DEFINITION) as FragmentDefinitionNode[]).map(
      (fragmentDef) => ({
        node: fragmentDef,
        name: fragmentDef.name.value,
        onType: fragmentDef.typeCondition.name.value,
        isExternal: false,
      })
    ),
    ...(config.externalFragments || []),
  ];

  const visitorResult = visit(allAst, {
    leave: new PythonDocumentsVisitor(schema, config, allFragments),
  });

  return visitorResult.definitions.join('\n');
};

export { PythonDocumentsVisitor };
