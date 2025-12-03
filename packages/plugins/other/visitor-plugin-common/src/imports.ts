import { dirname, isAbsolute, join, relative, resolve } from 'path';
import parse from 'parse-filepath';
import type { ParsedEnumValuesMap } from './types';

export type ImportDeclaration<T = string> = {
  outputPath: string;
  importSource: ImportSource<T>;
  baseOutputDir: string;
  baseDir: string;
  typesImport: boolean;
  emitLegacyCommonJSImports: boolean;
};

export type ImportSource<T = string> = {
  /**
   * Source path, relative to the `baseOutputDir`
   */
  path: string;
  /**
   * Namespace to import source as
   */
  namespace?: string;
  /**
   * Entity names to import
   */
  identifiers?: T[];
};

export type FragmentImport = {
  name: string;
  kind: 'type' | 'document';
};

export function generateFragmentImportStatement(
  statement: ImportDeclaration<FragmentImport>,
  kind: 'type' | 'document' | 'both'
): string {
  const { importSource: fragmentImportSource, ...rest } = statement;
  const { identifiers, path, namespace } = fragmentImportSource;
  const importSource: ImportSource<string> = {
    identifiers: identifiers
      .filter(fragmentImport => kind === 'both' || kind === fragmentImport.kind)
      .map(({ name }) => name),
    path,
    namespace,
  };
  return generateImportStatement({
    importSource,
    ...rest,
    typesImport: kind === 'type' ? statement.typesImport : false,
  });
}

export function generateImportStatement(statement: ImportDeclaration): string {
  const { baseDir, importSource, outputPath, typesImport } = statement;
  const importPath = resolveImportPath(baseDir, outputPath, importSource.path);
  const importNames = importSource.identifiers?.length
    ? `{ ${Array.from(new Set(importSource.identifiers)).join(', ')} }`
    : '*';
  const importExtension =
    importPath.startsWith('/') || importPath.startsWith('.') ? (statement.emitLegacyCommonJSImports ? '' : '.js') : '';
  const importAlias = importSource.namespace ? ` as ${importSource.namespace}` : '';
  const importStatement = typesImport ? 'import type' : 'import';
  return `${importStatement} ${importNames}${importAlias} from '${importPath}${importExtension}';${
    importAlias ? '\n' : ''
  }`;
  // return `${importStatement} ${importNames}${importAlias} from '${importPath}';${importAlias ? '\n' : ''}`;
}

function resolveImportPath(baseDir: string, outputPath: string, sourcePath: string) {
  const shouldAbsolute = !sourcePath.startsWith('~');
  if (shouldAbsolute) {
    const absGeneratedFilePath = resolve(baseDir, outputPath);
    const absImportFilePath = resolve(baseDir, sourcePath);
    return resolveRelativeImport(absGeneratedFilePath, absImportFilePath);
  }
  return sourcePath.replace(`~`, '');
}

export function resolveRelativeImport(from: string, to: string): string {
  if (!isAbsolute(from)) {
    throw new Error(`Argument 'from' must be an absolute path, '${from}' given.`);
  }
  if (!isAbsolute(to)) {
    throw new Error(`Argument 'to' must be an absolute path, '${to}' given.`);
  }
  return fixLocalFilePath(clearExtension(relative(dirname(from), to)));
}

export function resolveImportSource<T>(source: string | ImportSource<T>): ImportSource<T> {
  return typeof source === 'string' ? { path: source } : source;
}

export function clearExtension(path: string): string {
  const parsedPath = parse(path);
  return join(parsedPath.dir, parsedPath.name).replace(/\\/g, '/');
}

export function fixLocalFilePath(path: string): string {
  return path.startsWith('..') ? path : `./${path}`;
}

export function getEnumsImports({
  enumValues,
  useTypeImports,
}: {
  enumValues: ParsedEnumValuesMap;
  useTypeImports: boolean;
}): string[] {
  function handleEnumValueMapper({
    typeIdentifier,
    importIdentifier,
    sourceIdentifier,
    sourceFile,
    useTypeImports,
  }: {
    typeIdentifier: string;
    importIdentifier: string | null;
    sourceIdentifier: string | null;
    sourceFile: string | null;
    useTypeImports: boolean;
  }): string[] {
    if (importIdentifier !== sourceIdentifier) {
      // use namespace import to dereference nested enum
      // { enumValues: { MyEnum: './my-file#NS.NestedEnum' } }
      return [
        buildTypeImport({ identifier: importIdentifier || sourceIdentifier, source: sourceFile, useTypeImports }),
        `import ${typeIdentifier} = ${sourceIdentifier};`,
      ];
    }
    if (sourceIdentifier !== typeIdentifier) {
      return [
        buildTypeImport({ identifier: `${sourceIdentifier} as ${typeIdentifier}`, source: sourceFile, useTypeImports }),
      ];
    }
    return [buildTypeImport({ identifier: importIdentifier || sourceIdentifier, source: sourceFile, useTypeImports })];
  }

  return Object.keys(enumValues)
    .flatMap(enumName => {
      const mappedValue = enumValues[enumName];
      if (mappedValue.sourceFile) {
        if (mappedValue.isDefault) {
          return [
            buildTypeImport({
              identifier: mappedValue.typeIdentifier,
              source: mappedValue.sourceFile,
              asDefault: true,
              useTypeImports,
            }),
          ];
        }

        return handleEnumValueMapper({
          typeIdentifier: mappedValue.typeIdentifier,
          importIdentifier: mappedValue.importIdentifier,
          sourceIdentifier: mappedValue.sourceIdentifier,
          sourceFile: mappedValue.sourceFile,
          useTypeImports,
        });
      }

      return [];
    })
    .filter(Boolean);
}

export function buildTypeImport({
  identifier,
  source,
  useTypeImports,
  asDefault = false,
}: {
  identifier: string;
  source: string;
  useTypeImports: boolean;
  asDefault?: boolean;
}): string {
  if (asDefault) {
    if (useTypeImports) {
      return `import type { default as ${identifier} } from '${source}';`;
    }
    return `import ${identifier} from '${source}';`;
  }
  return `import${useTypeImports ? ' type' : ''} { ${identifier} } from '${source}';`;
}
