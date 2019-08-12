import { parse, dirname, relative, join, isAbsolute } from 'path';
import { DocumentNode, visit, FragmentSpreadNode, FragmentDefinitionNode, FieldNode, Kind, InputValueDefinitionNode } from 'graphql';
import { FragmentNameToFile } from './index';

export function appendExtensionToFilePath(baseFilePath: string, extension: string) {
  const parsedPath = parse(baseFilePath);

  return join(parsedPath.dir, parsedPath.name + extension).replace(/\\/g, '/');
}

export function clearExtension(path: string): string {
  const parsedPath = parse(path);

  return join(parsedPath.dir, parsedPath.name).replace(/\\/g, '/');
}

export function extractExternalFragmentsInUse(
  documentNode: DocumentNode | FragmentDefinitionNode,
  fragmentNameToFile: FragmentNameToFile,
  result: { [fragmentName: string]: number } = {},
  ignoreList: Set<string> = new Set(),
  level = 0
): { [fragmentName: string]: number } {
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
          result[node.name.value] = level;

          if (fragmentNameToFile[node.name.value]) {
            extractExternalFragmentsInUse(fragmentNameToFile[node.name.value].node, fragmentNameToFile, result, ignoreList, level + 1);
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

export function isUsingTypes(document: DocumentNode): boolean {
  let foundFields = 0;

  visit(document, {
    enter: {
      InputValueDefinition: () => {
        foundFields++;
      },
      Field: (node: FieldNode) => {
        const selections = node.selectionSet ? node.selectionSet.selections || [] : [];

        if (selections.length === 0 || selections[0].kind === Kind.FRAGMENT_SPREAD) {
          foundFields++;
        }
      },
    },
  });

  return foundFields > 0;
}
