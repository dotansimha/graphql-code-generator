import { join } from 'path';
import { DocumentNode, visit, FragmentSpreadNode, FragmentDefinitionNode } from 'graphql';
import { FragmentRegistry } from './fragment-resolver';
import parsePath from 'parse-filepath';

export function defineFilepathSubfolder(baseFilePath: string, folder: string) {
  const parsedPath = parsePath(baseFilePath);
  return join(parsedPath.dir, folder, parsedPath.base).replace(/\\/g, '/');
}

export function appendExtensionToFilePath(baseFilePath: string, extension: string) {
  const parsedPath = parsePath(baseFilePath);

  return join(parsedPath.dir, parsedPath.name + extension).replace(/\\/g, '/');
}

export function extractExternalFragmentsInUse(
  documentNode: DocumentNode | FragmentDefinitionNode,
  fragmentNameToFile: FragmentRegistry,
  dedupeFragments = false,
  result: { [fragmentName: string]: number } = {},
  level = 0
): { [fragmentName: string]: number } {
  const ignoreList: Set<string> = new Set();

  // First, take all fragments definition from the current file, and mark them as ignored
  visit(documentNode, {
    enter: {
      FragmentDefinition: (node: FragmentDefinitionNode) => {
        ignoreList.add(node.name.value);
      },
    },
  });

  // Then, look for all used fragments in this document
  visit(documentNode, {
    enter: {
      FragmentSpread: (node: FragmentSpreadNode) => {
        if (!ignoreList.has(node.name.value)) {
          if (
            result[node.name.value] === undefined ||
            (result[node.name.value] !== undefined && level < result[node.name.value])
          ) {
            result[node.name.value] = level;

            if (fragmentNameToFile[node.name.value]) {
              extractExternalFragmentsInUse(
                fragmentNameToFile[node.name.value].node,
                fragmentNameToFile,
                dedupeFragments,
                result,
                level + (documentNode.kind === 'Document' && dedupeFragments ? 0 : 1)
              );
            }
          }
        }
      },
    },
  });

  return result;
}
