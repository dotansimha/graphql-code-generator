import { oldVisit, PluginFunction, Types } from '@graphql-codegen/plugin-helpers';
import { LoadedFragment, optimizeOperations } from '@graphql-codegen/visitor-plugin-common';
import { concatAST, FragmentDefinitionNode, GraphQLSchema, Kind } from 'graphql';
import { TypeScriptDocumentsPluginConfig } from './config.js';
import { TypeScriptDocumentsVisitor } from './visitor.js';

export { TypeScriptDocumentsPluginConfig } from './config.js';

export const plugin: PluginFunction<TypeScriptDocumentsPluginConfig, Types.ComplexPluginOutput> = async (
  inputSchema: GraphQLSchema,
  rawDocuments: Types.DocumentFile[],
  config: TypeScriptDocumentsPluginConfig
) => {
  const schema = config.nullability?.errorHandlingClient ? await semanticToStrict(inputSchema) : inputSchema;

  const documents = config.flattenGeneratedTypes
    ? optimizeOperations(schema, rawDocuments, {
        includeFragments: config.flattenGeneratedTypesIncludeFragments,
      })
    : rawDocuments;
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

  const visitor = new TypeScriptDocumentsVisitor(schema, config, allFragments);

  const visitorResult = oldVisit(allAst, {
    leave: visitor,
  });

  let content = visitorResult.definitions.join('\n');

  if (config.addOperationExport) {
    const exportConsts = [];

    for (const d of allAst.definitions) {
      if ('name' in d) {
        exportConsts.push(`export declare const ${d.name.value}: import("graphql").DocumentNode;`);
      }
    }

    content = visitorResult.definitions.concat(exportConsts).join('\n');
  }

  if (config.globalNamespace) {
    content = `
    declare global {
      ${content}
    }`;
  }

  return {
    prepend: [...visitor.getImports(), ...visitor.getGlobalDeclarations(visitor.config.noExport)],
    content,
  };
};

export { TypeScriptDocumentsVisitor };

const semanticToStrict = async (schema: GraphQLSchema): Promise<GraphQLSchema> => {
  try {
    const sock = await import('graphql-sock');
    return sock.semanticToStrict(schema);
  } catch {
    throw new Error(
      "To use the `nullability.errorHandlingClient` option, you must install the 'graphql-sock' package."
    );
  }
};
