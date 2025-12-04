import { oldVisit, PluginFunction, Types } from '@graphql-codegen/plugin-helpers';
import { transformSchemaAST } from '@graphql-codegen/schema-ast';
import { optimizeOperations } from '@graphql-codegen/visitor-plugin-common';
import { concatAST, GraphQLSchema } from 'graphql';
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

  const visitor = new TypeScriptDocumentsVisitor(schema, config, allAst);

  const operationsResult = oldVisit(allAst, { leave: visitor });

  let operationsContent = operationsResult.definitions.join('\n');

  if (config.addOperationExport) {
    const exportConsts = [];

    for (const d of allAst.definitions) {
      if ('name' in d) {
        exportConsts.push(`export declare const ${d.name.value}: import("graphql").DocumentNode;`);
      }
    }

    operationsContent = operationsResult.definitions.concat(exportConsts).join('\n');
  }

  if (config.globalNamespace) {
    operationsContent = `
    declare global {
      ${operationsContent}
    }`;
  }

  const schemaTypes = oldVisit(transformSchemaAST(schema, config).ast, { leave: visitor });

  // IMPORTANT: when a visitor leaves a node with no transformation logic,
  // It will leave the node as an object.
  // Here, we filter in nodes that have been turned into strings, i.e. they have been transformed
  // This way, we do not have to explicitly declare a method for every node type to convert them to null
  const schemaTypesContent = schemaTypes.definitions.filter(def => typeof def === 'string').join('\n');

  const content: string[] = [];
  if (schemaTypesContent) {
    content.push(schemaTypesContent);
  }
  content.push(operationsContent);

  return {
    prepend: [
      ...visitor.getImports(),
      ...visitor.getEnumsImports(),
      ...visitor.getGlobalDeclarations(visitor.config.noExport),
      visitor.getExactUtilityType(),
    ],
    content: content.join('\n'),
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
