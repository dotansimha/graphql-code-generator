import { parse, dirname, relative } from 'path';
import { DocumentNode, visit, FragmentSpreadNode, FragmentDefinitionNode } from 'graphql';
import { FragmentNameToFile } from './index';

export function appendExtensionToFilePath(baseFilePath: string, extension: string) {
  const parsedPath = parse(baseFilePath);

  return parsedPath.dir + '/' + parsedPath.name + extension;
}

export function clearExtension(path: string): string {
  const parsedPath = parse(path);

  return parsedPath.dir + '/' + parsedPath.name;
}

export function extractExternalFragmentsInUse(documentNode: DocumentNode | FragmentDefinitionNode, fragmentNameToFile: FragmentNameToFile, result: Set<string> = new Set(), ignoreList: Set<string> = new Set()): Set<string> {
  visit(documentNode, {
    enter: {
      FragmentDefinition: (node: FragmentDefinitionNode) => {
        ignoreList.add(node.name.value);
      },
    },
    leave: {
      FragmentSpread: (node: FragmentSpreadNode) => {
        if (!ignoreList.has(node.name.value)) {
          result.add(node.name.value);

          if (fragmentNameToFile[node.name.value]) {
            extractExternalFragmentsInUse(fragmentNameToFile[node.name.value].node, fragmentNameToFile, result, ignoreList);
          }
        }
      },
    },
  });

  return result;
}

export function fixLocalFile(path: string): string {
  if (!path.startsWith('..') && !path.startsWith('&&')) {
    return `.${path}`;
  }

  return path;
}

export function resolveRelativeImport(from: string, to: string): string {
  return fixLocalFile(clearExtension(relative(dirname(from), to)));
}
