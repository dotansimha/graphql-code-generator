import { parse, dirname, relative, join, isAbsolute } from 'path';
import { DocumentNode, visit, FragmentSpreadNode, FragmentDefinitionNode } from 'graphql';
import { FragmentNameToFile } from './index';

export function appendExtensionToFilePath(baseFilePath: string, extension: string) {
  const parsedPath = parse(baseFilePath);

  return join(parsedPath.dir, parsedPath.name + extension).replace(/\\/g, '/');
}

export function clearExtension(path: string): string {
  const parsedPath = parse(path);

  return join(parsedPath.dir, parsedPath.name).replace(/\\/g, '/');
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
    return `./${path}`;
  }

  return path;
}

export function resolveRelativeImport(from: string, to: string): string {
  if (!isAbsolute(from)) {
    throw new Error(`Argument 'from' must be an absolute path, '${from}' given.`);
  }
  if (!isAbsolute(to)) {
    throw new Error(`Argument 'to' must be an absolute path, '${to}' given.`);
  }
  return fixLocalFile(clearExtension(relative(dirname(from), to)));
}
