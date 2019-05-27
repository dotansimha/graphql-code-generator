import { Types, toPascalCase } from '@graphql-codegen/plugin-helpers';
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
    const fragments = allAst.definitions.filter(d => d.kind === Kind.FRAGMENT_DEFINITION) as FragmentDefinitionNode[];
    const externalFragments = fragments.map(frag => ({
      isExternal: true,
      importFrom: frag.name.value,
      name: frag.name.value,
      onType: frag.typeCondition.name.value,
      node: frag,
    }));

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
        const fileName = ast.name.value.toLowerCase().endsWith(ast.operation) ? ast.name.value : `${ast.name.value}${toPascalCase(ast.operation)}`;

        return {
          filename: join(outDir, 'operations/', fileName + '.java'),
          plugins: options.plugins,
          pluginMap: options.pluginMap,
          config: {
            ...options.config,
            externalFragments,
          },
          schema: options.schema,
          documents: [{ content: { kind: Kind.DOCUMENT, definitions: [ast] }, filePath: '' }],
        };
      }),
      ...fragments.map((ast: FragmentDefinitionNode) => {
        return {
          filename: join(outDir, 'fragment/', ast.name.value + '.java'),
          plugins: options.plugins,
          pluginMap: options.pluginMap,
          config: {
            ...options.config,
            externalFragments,
          },
          schema: options.schema,
          documents: [{ content: { kind: Kind.DOCUMENT, definitions: [ast] }, filePath: '' }],
        };
      }),
    ];
  },
};
