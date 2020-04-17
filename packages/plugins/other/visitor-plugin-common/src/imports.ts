import { dirname, isAbsolute, join, relative, resolve } from 'path';
import parse from 'parse-filepath';

export type ImportDecleration<T = string> = {
  outputPath: string;
  importSource: ImportSource<T>;
  baseOutputDir: string;
  baseDir: string;
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
  statement: ImportDecleration<FragmentImport>,
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
  return generateImportStatement({ importSource, ...rest });
}

export function generateImportStatement(statement: ImportDecleration): string {
  const { baseDir, importSource, outputPath } = statement;
  const importPath = resolveImportPath(baseDir, outputPath, importSource.path);
  const importNames =
    importSource.identifiers && importSource.identifiers.length ? `{ ${importSource.identifiers.join(', ')} }` : '*';
  const importAlias = importSource.namespace ? ` as ${importSource.namespace}` : '';
  return `import ${importNames}${importAlias} from '${importPath}';${importAlias ? '\n' : ''}`;
}

function resolveImportPath(baseDir: string, outputPath: string, sourcePath: string) {
  const shouldAbsolute = !sourcePath.startsWith('~');
  if (shouldAbsolute) {
    const absGeneratedFilePath = resolve(baseDir, outputPath);
    const absImportFilePath = resolve(baseDir, sourcePath);
    return resolveRelativeImport(absGeneratedFilePath, absImportFilePath);
  } else {
    return sourcePath.replace(`~`, '');
  }
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
  return !path.startsWith('..') ? `./${path}` : path;
}
