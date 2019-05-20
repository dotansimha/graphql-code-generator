import { Types } from '@graphql-codegen/plugin-helpers';
import { visit, concatAST, InputObjectTypeDefinitionNode, DocumentNode, Kind } from 'graphql';
import { join } from 'path';

export const preset: Types.OutputPreset = {
  buildGeneratesSection: options => {
    const outDir = options.baseOutputDir;
    const inputTypesAst = [];

    visit(options.schema, {
      enter: {
        InputObjectTypeDefinition(node: InputObjectTypeDefinitionNode) {
          inputTypesAst.push(node);
        },
      },
    });

    const inputTypesDocumentNode: DocumentNode = { kind: Kind.DOCUMENT, definitions: inputTypesAst };
    const operationsAst = concatAST(options.documents.reduce((prev, v) => [...prev, v.content], []));

    return [
      ...inputTypesDocumentNode.definitions.map((ast: InputObjectTypeDefinitionNode) => {
        return {
          filename: join(outDir, 'type/', ast.name.value + '.java'),
          plugins: options.plugins,
          pluginMap: options.pluginMap,
          config: options.config,
          schema: options.schema,
          documents: [{ skipValidation: true, content: { kind: Kind.DOCUMENT, definitions: [ast] }, filePath: '' }],
        };
      }),
      // ...operationsAst.definitions.map((ast: OperationDefinitionNode) => {
      //   return {
      //     filename: join(outDir, 'operations', ast.name.value + '.java'),
      //     plugins: options.plugins,
      //     pluginMap: options.pluginMap,
      //     config: options.config,
      //     schema: options.schema,
      //     documents: [{ content: { kind: Kind.DOCUMENT, definitions: [ast] }, filePath: '' }],
      //   };
      // }),
    ];
  },
};
