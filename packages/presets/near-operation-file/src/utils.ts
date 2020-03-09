import { parse, dirname, relative, join, isAbsolute } from 'path';
import { DocumentNode, visit, FragmentSpreadNode, FragmentDefinitionNode } from 'graphql';
import { FragmentRegistry } from './fragment-resolver';

export function defineFilepathSubfolder(baseFilePath: string, folder: string) {
  const parsedPath = parse(baseFilePath);
  return join(parsedPath.dir, folder, parsedPath.base).replace(/\\/g, '/');
}

export function appendExtensionToFilePath(baseFilePath: string, extension: string) {
  const parsedPath = parse(baseFilePath);

  return join(parsedPath.dir, parsedPath.name + extension).replace(/\\/g, '/');
}

export function clearExtension(path: string): string {
  const parsedPath = parse(path);

  return join(parsedPath.dir, parsedPath.name).replace(/\\/g, '/');
}

export function extractExternalFragmentsInUse(documentNode: DocumentNode | FragmentDefinitionNode, fragmentNameToFile: FragmentRegistry, result: { [fragmentName: string]: number } = {}, level = 0): { [fragmentName: string]: number } {
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
          if (result[node.name.value] === undefined || (result[node.name.value] !== undefined && level < result[node.name.value])) {
            result[node.name.value] = level;

            if (fragmentNameToFile[node.name.value]) {
              extractExternalFragmentsInUse(fragmentNameToFile[node.name.value].node, fragmentNameToFile, result, level + 1);
            }
          }
        }
      },
    },
  });

  return result;
}

export function fixLocalFile(path: string): string {
  if (!path.startsWith('..')) {
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
