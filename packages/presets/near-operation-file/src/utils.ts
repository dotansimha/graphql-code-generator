import { parse, dirname, relative, join, isAbsolute } from 'path';
import { DocumentNode, visit, FragmentSpreadNode, FragmentDefinitionNode, FieldNode, Kind, InputValueDefinitionNode } from 'graphql';
import { FragmentNameToFile } from './index';
import { VariableDefinitionNode } from 'graphql';

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

export function isUsingTypes(document: DocumentNode, externalFragments: string[]): boolean {
  let foundFields = 0;

  visit(document, {
    enter: {
      VariableDefinition: (node: VariableDefinitionNode, key, parent, path, anscestors) => {
        const insideIgnoredFragment = (anscestors as any).find(f => f.kind && f.kind === 'FragmentDefinition' && externalFragments.includes(f.name.value));

        if (insideIgnoredFragment) {
          return;
        }
        foundFields++;
      },
      InputValueDefinition: (node: InputValueDefinitionNode, key, parent, path, anscestors) => {
        const insideIgnoredFragment = (anscestors as any).find(f => f.kind && f.kind === 'FragmentDefinition' && externalFragments.includes(f.name.value));

        if (insideIgnoredFragment) {
          return;
        }
        foundFields++;
      },
      Field: (node: FieldNode, key, parent, path, anscestors) => {
        const insideIgnoredFragment = (anscestors as any).find(f => f.kind && f.kind === 'FragmentDefinition' && externalFragments.includes(f.name.value));

        if (insideIgnoredFragment) {
          return;
        }
        const selections = node.selectionSet ? node.selectionSet.selections || [] : [];
        const relevantFragmentSpreads = selections.filter(s => s.kind === Kind.FRAGMENT_SPREAD && !externalFragments.includes(s.name.value));
        if (selections.length === 0 || relevantFragmentSpreads.length > 0) {
          foundFields++;
        }
      },
    },
  });

  return foundFields > 0;
}
