import { Types, PluginValidateFn, PluginFunction } from '@graphql-codegen/plugin-helpers';
import { visit, concatAST, GraphQLSchema, Kind, FragmentDefinitionNode } from 'graphql';
import { TypeScriptTypedDocumentNodesConfig } from 'packages/plugins/typescript/typed-document-node/src/config';
import { extname } from 'path';
import {
  LoadedFragment,
  RawClientSideBasePluginConfig,
  DocumentMode,
  optimizeOperations,
} from '@graphql-codegen/visitor-plugin-common';
import { TypeScriptDocumentNodesVisitor } from './visitor';

export const plugin: PluginFunction<TypeScriptTypedDocumentNodesConfig> = (
  schema: GraphQLSchema,
  rawDocuments: Types.DocumentFile[],
  config: TypeScriptTypedDocumentNodesConfig
) => {
  const documents = config.flattenGeneratedTypes ? optimizeOperations(schema, rawDocuments) : rawDocuments;
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

  const deDupFunctionName = 'deDupeDefinitions';

  const closingBracxketFinder = (source: string, index: number) => {
    if (source[index] != '[') {
      throw new Error("No '[' at index " + index);
    }
    let depth = 1;
    for (let i = index + 1; i < source.length; i++) {
      switch (source[i]) {
        case '[':
          depth++;
          break;
        case ']':
          if (--depth == 0) {
            return i;
          }
          break;
      }
    }
    return -1;
  };

  const definitionsWraper = (source: string) => {
    const startIndex = source.indexOf('[', source.indexOf('definitions:'));
    if (startIndex === -1) {
      return source;
    }

    const endIndex = closingBracxketFinder(source, startIndex);
    if (endIndex === -1) {
      return source;
    }

    return `${source.slice(0, startIndex)}${deDupFunctionName}(${source.slice(startIndex, endIndex + 1)})${source.slice(
      endIndex + 1
    )}`;
  };

  const deDupDefinitions = (source: string): string => {
    let lines = source.split(/\r\n|\r|\n/);

    const deDupFunctionCode = `
    const ${deDupFunctionName} = (definitions) => {
        const definitionsVault = {};
        return definitions.filter(
          (definition) => {
            if (definition.kind !== 'FragmentDefinition') return true;
            var name = definition.name.value
            if (definitionsVault[name]) {
              return false;
            } else {
              definitionsVault[name] = true;
              return true;
            }
          }
        )
      }
    `;

    let includeDeDupFuncFlag = false;
    lines = lines.map(line => {
      if (line.includes(`"definitions":`)) {
        includeDeDupFuncFlag = true;
        return definitionsWraper(line);
      }
      return line;
    });
    if (includeDeDupFuncFlag) {
      lines.unshift(deDupFunctionCode);
    }

    return lines.join('\n');
  };

  const visitor = new TypeScriptDocumentNodesVisitor(schema, allFragments, config, documents);
  const visitorResult = visit(allAst, { leave: visitor });

  return {
    prepend: allAst.definitions.length === 0 ? [] : visitor.getImports(),
    content: deDupDefinitions(
      [visitor.fragments, ...visitorResult.definitions.filter(t => typeof t === 'string')].join('\n')
    ),
  };
};

export const validate: PluginValidateFn<RawClientSideBasePluginConfig> = async (
  schema: GraphQLSchema,
  documents: Types.DocumentFile[],
  config,
  outputFile: string
) => {
  if (config && config.documentMode === DocumentMode.string) {
    throw new Error(`Plugin "typed-document-node" does not allow using 'documentMode: string' configuration!`);
  }

  if (extname(outputFile) !== '.ts' && extname(outputFile) !== '.tsx') {
    throw new Error(`Plugin "typed-document-node" requires extension to be ".ts" or ".tsx"!`);
  }
};
