import { concatAST, FragmentDefinitionNode, GraphQLSchema, Kind, type DocumentNode } from 'graphql';
import { oldVisit, PluginFunction, Types } from '@graphql-codegen/plugin-helpers';
import { LoadedFragment, optimizeOperations } from '@graphql-codegen/visitor-plugin-common';
import { TypeScriptDocumentsPluginConfig } from './config.js';
import { TypeScriptDocumentsVisitor } from './visitor.js';

export { TypeScriptDocumentsPluginConfig } from './config.js';

export const plugin: PluginFunction<
  TypeScriptDocumentsPluginConfig,
  Types.ComplexPluginOutput
> = async (
  inputSchema: GraphQLSchema,
  rawDocuments: Types.DocumentFile[],
  config: TypeScriptDocumentsPluginConfig,
) => {
  const schema = config.nullability?.errorHandlingClient
    ? await semanticToStrict(inputSchema)
    : inputSchema;

  const documents = config.flattenGeneratedTypes
    ? optimizeOperations(schema, rawDocuments, {
        includeFragments: config.flattenGeneratedTypesIncludeFragments,
      })
    : rawDocuments;

  const parsedDocuments = documents.reduce<{
    all: {
      documentFiles: Types.DocumentFile[];
      documentNodes: DocumentNode[];
    };
    standard: {
      documentFiles: Types.DocumentFile[];
      documentNodes: DocumentNode[];
    };
  }>(
    (prev, document) => {
      prev.all.documentFiles.push(document);
      prev.all.documentNodes.push(document.document);

      if (document.type === 'standard') {
        prev.standard.documentFiles.push(document);
        prev.standard.documentNodes.push(document.document);
      }

      return prev;
    },
    {
      all: { documentFiles: [], documentNodes: [] },
      standard: { documentFiles: [], documentNodes: [] },
    },
  );

  // For Fragment types to resolve correctly, we must get read all docs (`standard` and `read-only`)
  // Fragment types are usually (but not always) in `read-only` files in certain setup, like a monorepo.
  const allDocumentsAST = concatAST(parsedDocuments.all.documentNodes);
  const allFragments: LoadedFragment[] = [
    ...(
      allDocumentsAST.definitions.filter(
        d => d.kind === Kind.FRAGMENT_DEFINITION,
      ) as FragmentDefinitionNode[]
    ).map(fragmentDef => ({
      node: fragmentDef,
      name: fragmentDef.name.value,
      onType: fragmentDef.typeCondition.name.value,
      isExternal: false,
    })),
    ...(config.externalFragments || []),
  ];

  const visitor = new TypeScriptDocumentsVisitor(schema, config, allFragments);

  // We only visit `standard` documents to generate types.
  // `read-only` documents are included as references for typechecking and completeness i.e. only used for reading purposes, no writing.
  const documentsToVisitAST = concatAST(parsedDocuments.standard.documentNodes);
  const visitorResult = oldVisit(documentsToVisitAST, {
    leave: visitor,
  });

  let content = visitorResult.definitions.join('\n');

  if (config.addOperationExport) {
    const exportConsts = [];

    for (const d of allDocumentsAST.definitions) {
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
      "To use the `nullability.errorHandlingClient` option, you must install the 'graphql-sock' package.",
    );
  }
};
