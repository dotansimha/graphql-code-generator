import { parse, dirname, relative, join, isAbsolute } from 'path';
import { DocumentNode, visit, FragmentSpreadNode, FragmentDefinitionNode, FieldNode, Kind, InputValueDefinitionNode, GraphQLSchema, OperationDefinitionNode, GraphQLNamedType, isNonNullType } from 'graphql';
import { FragmentNameToFile } from './index';
import { VariableDefinitionNode } from 'graphql';
import { isObjectType } from 'graphql';
import { GraphQLOutputType } from 'graphql';
import { isInterfaceType } from 'graphql';
import { print } from 'graphql';

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

export function isUsingTypes(document: DocumentNode, externalFragments: string[], schema?: GraphQLSchema): boolean {
  let foundFields = 0;
  let typesStack: GraphQLOutputType[] = [];

  visit(document, {
    Field: {
      enter: (node: FieldNode, key, parent, path, anscestors) => {
        const insideIgnoredFragment = (anscestors as any).find(f => f.kind && f.kind === 'FragmentDefinition' && externalFragments.includes(f.name.value));

        if (insideIgnoredFragment) {
          return;
        }

        if (schema) {
          const lastType = typesStack[typesStack.length - 1];
          if (lastType && (isObjectType(lastType) || isInterfaceType(lastType))) {
            const currentType = lastType.getFields()[node.name.value].type;

            // To handle `Maybe` usage
            if (!isNonNullType(currentType)) {
              foundFields++;
            }

            typesStack.push(currentType);
          }
        }

        const selections = node.selectionSet ? node.selectionSet.selections || [] : [];
        const relevantFragmentSpreads = selections.filter(s => s.kind === Kind.FRAGMENT_SPREAD && !externalFragments.includes(s.name.value));

        if (selections.length === 0 || relevantFragmentSpreads.length > 0) {
          foundFields++;
        }
      },
      leave: (node: FieldNode, key, parent, path, anscestors) => {
        const insideIgnoredFragment = (anscestors as any).find(f => f.kind && f.kind === 'FragmentDefinition' && externalFragments.includes(f.name.value));

        if (insideIgnoredFragment) {
          return;
        }

        if (schema) {
          const currentType = typesStack[typesStack.length - 1];
          if (currentType && isObjectType(currentType)) {
            typesStack.pop();
          }
        }
      },
    },
    OperationDefinition: {
      enter: (node: OperationDefinitionNode) => {
        if (schema) {
          if (node.operation === 'query') {
            typesStack.push(schema.getQueryType());
          } else if (node.operation === 'mutation') {
            typesStack.push(schema.getMutationType());
          } else if (node.operation === 'subscription') {
            typesStack.push(schema.getSubscriptionType());
          }
        }
      },
      leave: () => {
        if (schema) {
          typesStack.pop();
        }
      },
    },
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
    },
  });

  return foundFields > 0;
}
