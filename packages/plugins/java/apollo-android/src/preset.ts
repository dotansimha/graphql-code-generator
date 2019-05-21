import { Types } from '@graphql-codegen/plugin-helpers';
import { visit, concatAST, InputObjectTypeDefinitionNode, DocumentNode, Kind, OperationDefinitionNode, FragmentDefinitionNode } from 'graphql';
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
    const allAst = concatAST(options.documents.reduce((prev, v) => [...prev, v.content], []));
    const operationsAst = allAst.definitions.filter(d => d.kind === Kind.OPERATION_DEFINITION) as OperationDefinitionNode[];
    const externalFragments = allAst.definitions.filter(d => d.kind === Kind.FRAGMENT_DEFINITION) as FragmentDefinitionNode[];

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
      ...operationsAst.map((ast: OperationDefinitionNode) => {
        return {
          filename: join(outDir, 'operations/', ast.name.value + '.java'),
          plugins: options.plugins,
          pluginMap: options.pluginMap,
          config: {
            ...options.config,
            externalFragments: externalFragments.map(frag => ({
              isExternal: true,
              importFrom: frag.name.value,
              name: frag.name.value,
              onType: frag.typeCondition.name.value,
              node: frag,
            })),
          },
          schema: options.schema,
          documents: [{ content: { kind: Kind.DOCUMENT, definitions: [ast] }, filePath: '' }],
        };
      }),
    ];
  },
};
