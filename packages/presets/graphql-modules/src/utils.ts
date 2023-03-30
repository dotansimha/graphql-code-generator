import { Source } from '@graphql-tools/utils';
import {
  DefinitionNode,
  DocumentNode,
  FieldDefinitionNode,
  InputValueDefinitionNode,
  Kind,
  NamedTypeNode,
  TypeNode,
} from 'graphql';
import parse from 'parse-filepath';

const sep = '/';

/**
 * Searches every node to collect used types
 */
export function collectUsedTypes(doc: DocumentNode): string[] {
  const used: string[] = [];

  for (const node of doc.definitions) {
    findRelated(node);
  }

  function markAsUsed(type: string) {
    pushUnique(used, type);
  }

  function findRelated(node: DefinitionNode | FieldDefinitionNode | InputValueDefinitionNode | NamedTypeNode) {
    if (node.kind === Kind.OBJECT_TYPE_DEFINITION || node.kind === Kind.OBJECT_TYPE_EXTENSION) {
      // Object
      markAsUsed(node.name.value);

      if (node.fields) {
        for (const n of node.fields) {
          findRelated(n);
        }
      }

      if (node.interfaces) {
        for (const n of node.interfaces) {
          findRelated(n);
        }
      }
    } else if (node.kind === Kind.INPUT_OBJECT_TYPE_DEFINITION || node.kind === Kind.INPUT_OBJECT_TYPE_EXTENSION) {
      // Input
      markAsUsed(node.name.value);

      if (node.fields) {
        for (const n of node.fields) {
          findRelated(n);
        }
      }
    } else if (node.kind === Kind.INTERFACE_TYPE_DEFINITION || node.kind === Kind.INTERFACE_TYPE_EXTENSION) {
      // Interface
      markAsUsed(node.name.value);

      if (node.fields) {
        for (const n of node.fields) {
          findRelated(n);
        }
      }

      if (node.interfaces) {
        for (const n of node.interfaces) {
          findRelated(n)
        }
      }
    } else if (node.kind === Kind.UNION_TYPE_DEFINITION || node.kind === Kind.UNION_TYPE_EXTENSION) {
      // Union
      markAsUsed(node.name.value);

      if (node.types) {
        for (const n of node.types) {
          findRelated(n)
        }
      }
    } else if (node.kind === Kind.ENUM_TYPE_DEFINITION || node.kind === Kind.ENUM_TYPE_EXTENSION) {
      // Enum
      markAsUsed(node.name.value);
    } else if (node.kind === Kind.SCALAR_TYPE_DEFINITION || node.kind === Kind.SCALAR_TYPE_EXTENSION) {
      // Scalar
      if (!isGraphQLPrimitive(node.name.value)) {
        markAsUsed(node.name.value);
      }
    } else if (node.kind === Kind.INPUT_VALUE_DEFINITION) {
      // Argument
      findRelated(resolveTypeNode(node.type));
    } else if (node.kind === Kind.FIELD_DEFINITION) {
      // Field
      findRelated(resolveTypeNode(node.type));

      if (node.arguments) {
        for (const n of node.arguments) {
          findRelated(n)
        }
      }
    } else if (
      node.kind === Kind.NAMED_TYPE &&
      // Named type
      !isGraphQLPrimitive(node.name.value)
    ) {
      markAsUsed(node.name.value);
    }
  }

  return used;
}

export function resolveTypeNode(node: TypeNode): NamedTypeNode {
  if (node.kind === Kind.LIST_TYPE) {
    return resolveTypeNode(node.type);
  }

  if (node.kind === Kind.NON_NULL_TYPE) {
    return resolveTypeNode(node.type);
  }

  return node;
}

export function isGraphQLPrimitive(name: string): boolean {
  return ['String', 'Boolean', 'ID', 'Float', 'Int'].includes(name);
}

export function unique<T>(val: T, i: number, all: T[]): boolean {
  return i === all.indexOf(val);
}

export function withQuotes(val: string): string {
  return `'${val}'`;
}

export function indent(size: number) {
  const space = new Array(size).fill(' ').join('');

  function indentInner(val: string): string {
    return val
      .split('\n')
      .map(line => `${space}${line}`)
      .join('\n');
  }

  return indentInner;
}

export function buildBlock({ name, lines }: { name: string; lines: string[] }): string {
  if (!lines.length) {
    return '';
  }

  return [`${name} {`, ...lines.map(indent(2)), '};'].join('\n');
}

const getRelativePath = function (filepath: string, basePath: string) {
  const normalizedFilepath = normalize(filepath);
  const normalizedBasePath = ensureStartsWithSeparator(normalize(ensureEndsWithSeparator(basePath)));
  const [, relativePath] = normalizedFilepath.split(normalizedBasePath);
  return relativePath;
};

export function groupSourcesByModule(sources: Source[], basePath: string): Record<string, Source[]> {
  const grouped: Record<string, Source[]> = {};

  for (const source of sources) {
    const relativePath = getRelativePath(source.location, basePath);

    if (relativePath) {
      // PERF: we could guess the module by matching source.location with a list of already resolved paths
      const mod = extractModuleDirectory(source.location, basePath);

      grouped[mod] ||= [];

      grouped[mod].push(source);
    }
  }

  return grouped;
}

function extractModuleDirectory(filepath: string, basePath: string): string {
  const relativePath = getRelativePath(filepath, basePath);

  const [moduleDirectory] = relativePath.split(sep);

  return moduleDirectory;
}

export function stripFilename(path: string) {
  const parsedPath = parse(path);
  return normalize(parsedPath.dir);
}

export function normalize(path: string) {
  return path.replace(/\\/g, '/');
}

function ensureEndsWithSeparator(path: string) {
  return path.endsWith(sep) ? path : path + sep;
}

function ensureStartsWithSeparator(path: string) {
  return path.startsWith('.') ? path.replace(/^(..\/)|(.\/)/, '/') : path.startsWith('/') ? path : '/' + path;
}

/**
 * Pushes an item to a list only if the list doesn't include the item
 */
export function pushUnique<T>(list: T[], item: T): void {
  if (!list.includes(item)) {
    list.push(item);
  }
}

export function concatByKey<T extends Record<string, any[]>, K extends keyof T>(left: T, right: T, key: K) {
  // Remove duplicate, if an element is in right & left, it will be only once in the returned array.
  return [...new Set([...left[key], ...right[key]])];
}

export function uniqueByKey<T extends Record<string, any[]>, K extends keyof T>(left: T, right: T, key: K) {
  return left[key].filter(item => !right[key].includes(item));
}

export function createObject<K extends string, T>(keys: K[], valueFn: (key: K) => T) {
  const obj: Record<K, T> = {} as any;

  for (const key of keys) {
    obj[key] = valueFn(key);
  }

  return obj;
}
