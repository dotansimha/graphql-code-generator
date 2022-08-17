import { Types } from '@graphql-codegen/plugin-helpers';
import {
  visit,
  concatAST,
  InputObjectTypeDefinitionNode,
  DocumentNode,
  Kind,
  OperationDefinitionNode,
  FragmentDefinitionNode,
} from 'graphql';
import { join } from 'path';
import { FileType } from './file-type.js';
import { pascalCase } from 'change-case-all';

const packageNameToDirectory = (packageName: string): string => {
  return `./${packageName.split('.').join('/')}/`;
};

export const preset: Types.OutputPreset = {
  buildGeneratesSection: options => {
    const outDir = options.baseOutputDir;
    const inputTypesAst = [];

    visit(options.schema, {
      InputObjectTypeDefinition: {
        enter(node: InputObjectTypeDefinitionNode) {
          inputTypesAst.push(node);
        },
      },
    });

    const inputTypesDocumentNode: DocumentNode = { kind: Kind.DOCUMENT, definitions: inputTypesAst };
    const allAst = concatAST(options.documents.map(v => v.document));
    const operationsAst = allAst.definitions.filter(
      d => d.kind === Kind.OPERATION_DEFINITION
    ) as OperationDefinitionNode[];
    const fragments = allAst.definitions.filter(d => d.kind === Kind.FRAGMENT_DEFINITION) as FragmentDefinitionNode[];
    const externalFragments = fragments.map(frag => ({
      isExternal: true,
      importFrom: frag.name.value,
      name: frag.name.value,
      onType: frag.typeCondition.name.value,
      node: frag,
    }));

    return [
      {
        filename: join(outDir, packageNameToDirectory(options.config.typePackage), 'CustomType.java'),
        plugins: options.plugins,
        pluginMap: options.pluginMap,
        config: {
          ...options.config,
          fileType: FileType.CUSTOM_TYPES,
        },
        schema: options.schema,
        documents: [],
      },
      ...inputTypesDocumentNode.definitions.map((ast: InputObjectTypeDefinitionNode) => {
        const document: DocumentNode = { kind: Kind.DOCUMENT, definitions: [ast] };
        return {
          filename: join(outDir, packageNameToDirectory(options.config.typePackage), ast.name.value + '.java'),
          plugins: options.plugins,
          pluginMap: options.pluginMap,
          config: {
            ...options.config,
            fileType: FileType.INPUT_TYPE,
            skipDocumentsValidation: true,
          },
          schema: options.schema,
          documents: [{ document, location: '' }],
        };
      }),
      ...operationsAst.map((ast: OperationDefinitionNode) => {
        const fileName = ast.name.value.toLowerCase().endsWith(ast.operation)
          ? ast.name.value
          : `${ast.name.value}${pascalCase(ast.operation)}`;

        const document: DocumentNode = { kind: Kind.DOCUMENT, definitions: [ast] };
        return {
          filename: join(outDir, packageNameToDirectory(options.config.package), fileName + '.java'),
          plugins: options.plugins,
          pluginMap: options.pluginMap,
          config: {
            ...options.config,
            fileType: FileType.OPERATION,
            externalFragments,
          },
          schema: options.schema,
          documents: [{ document, location: '' }],
        };
      }),
      ...fragments.map((ast: FragmentDefinitionNode) => {
        const document: DocumentNode = { kind: Kind.DOCUMENT, definitions: [ast] };
        return {
          filename: join(outDir, packageNameToDirectory(options.config.fragmentPackage), ast.name.value + '.java'),
          plugins: options.plugins,
          pluginMap: options.pluginMap,
          config: {
            ...options.config,
            fileType: FileType.FRAGMENT,
            externalFragments,
          },
          schema: options.schema,
          documents: [{ document, location: '' }],
        };
      }),
    ];
  },
};
