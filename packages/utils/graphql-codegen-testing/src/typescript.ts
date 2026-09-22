import { dirname, join } from 'path';
import * as LZString from 'lz-string'; // lz-string is a package which has CJS/ESM issues. So, we cannot do `import { something } from 'lz-string'`
import {
  CompilerOptions,
  createCompilerHost,
  createProgram,
  createSourceFile,
  Diagnostic,
  flattenDiagnosticMessageText,
  JsxEmit,
  ModuleKind,
  ModuleResolutionKind,
  ScriptKind,
  ScriptTarget,
  ScriptTarget as ScriptTargetType,
  version as tsVersion,
} from 'typescript';
import { expect } from 'vitest';
import { Types } from '@graphql-codegen/plugin-helpers';

export function validateTs(
  pluginOutput: Types.PluginOutput,
  options: CompilerOptions = {
    noEmitOnError: true,
    noImplicitAny: true,
    moduleResolution: ModuleResolutionKind.NodeJs,
    experimentalDecorators: true,
    emitDecoratorMetadata: true,
    target: ScriptTarget.ES5,
    typeRoots: resolveTypeRoots(),
    jsx: JsxEmit.React,
    allowJs: true,
    skipLibCheck: true,
    lib: [
      join(dirname(require.resolve('typescript')), 'lib.es5.d.ts'),
      join(dirname(require.resolve('typescript')), 'lib.es6.d.ts'),
      join(dirname(require.resolve('typescript')), 'lib.dom.d.ts'),
      join(dirname(require.resolve('typescript')), 'lib.scripthost.d.ts'),
      join(dirname(require.resolve('typescript')), 'lib.es2015.d.ts'),
      join(dirname(require.resolve('typescript')), 'lib.esnext.d.ts'),
    ],
    module: ModuleKind.ESNext,
  },
  isTsx = false,
  isStrict = false,
  suspenseErrors: string[] = [],
  compileProgram = false,
): void {
  if (process.env.SKIP_VALIDATION) {
    return;
  }
  if (isStrict) {
    options.strictNullChecks = true;
    options.strict = true;
    options.strictBindCallApply = true;
    options.strictPropertyInitialization = true;
    options.alwaysStrict = true;
    options.strictFunctionTypes = true;
  }
  if (tsVersion.startsWith('6.')) {
    options.ignoreDeprecations ||= '6.0';
    options.types ||= ['node'];
  }

  const contents: string =
    typeof pluginOutput === 'string'
      ? pluginOutput
      : [
          ...new Set([
            ...(pluginOutput.prepend || []),
            pluginOutput.content,
            ...(pluginOutput.append || []),
          ]),
        ].join('\n');

  const cwd = resolveCallerDirectory();
  const testFile = join(cwd, `test-file.${isTsx ? 'tsx' : 'ts'}`);
  const errors: string[] = [];

  if (compileProgram) {
    const host = createCompilerHost(options);
    const program = createProgram([testFile], options, {
      ...host,
      getSourceFile: (
        fileName: string,
        languageVersion: ScriptTargetType,
        onError?: (message: string) => void,
        shouldCreateNewSourceFile?: boolean,
      ) => {
        if (fileName === testFile) {
          return createSourceFile(fileName, contents, options.target);
        }

        return host.getSourceFile(fileName, languageVersion, onError, shouldCreateNewSourceFile);
      },
      writeFile() {},
      useCaseSensitiveFileNames() {
        return false;
      },
      getCanonicalFileName(filename) {
        return filename;
      },
      getCurrentDirectory() {
        return cwd;
      },
      getNewLine() {
        return '\n';
      },
    });
    const emitResult = program.emit();
    const allDiagnostics = emitResult.diagnostics;

    for (const diagnostic of allDiagnostics) {
      if (diagnostic.file) {
        const { line, character } = diagnostic.file.getLineAndCharacterOfPosition(diagnostic.start);
        const message = flattenDiagnosticMessageText(diagnostic.messageText, '\n');
        errors.push(`${line + 1},${character + 1}: ${message} ->
    ${contents.split('\n')[line]}`);
      } else {
        errors.push(String(flattenDiagnosticMessageText(diagnostic.messageText, '\n')));
      }
    }
  } else {
    const result = createSourceFile(
      testFile,
      contents,
      ScriptTarget.ES2016,
      false,
      isTsx ? ScriptKind.TSX : undefined,
    ) as { parseDiagnostics?: Diagnostic[] };

    const allDiagnostics = result.parseDiagnostics;

    if (allDiagnostics && allDiagnostics.length > 0) {
      for (const diagnostic of allDiagnostics) {
        if (diagnostic.file) {
          const { line, character } = diagnostic.file.getLineAndCharacterOfPosition(
            diagnostic.start!,
          );
          const message = flattenDiagnosticMessageText(diagnostic.messageText, '\n');
          errors.push(`${line + 1},${character + 1}: ${message} ->
  ${contents.split('\n')[line]}`);
        } else {
          errors.push(String(flattenDiagnosticMessageText(diagnostic.messageText, '\n')));
        }
      }
    }
  }

  const relevantErrors = errors.filter(e => {
    if (e.includes('Cannot find module')) {
      return false;
    }

    for (const suspenseError of suspenseErrors) {
      if (e.includes(suspenseError)) {
        return false;
      }
    }

    return true;
  });

  if (relevantErrors && relevantErrors.length > 0) {
    if (relevantErrors.length === 1) {
      throw new Error(relevantErrors[0]);
    }
    throw new AggregateError(relevantErrors, relevantErrors.join('\n'));
  }
}

export function compileTs(
  contents: string,
  options: CompilerOptions = {
    noEmitOnError: true,
    noImplicitAny: true,
    moduleResolution: ModuleResolutionKind.NodeJs,
    allowSyntheticDefaultImports: true,
    experimentalDecorators: true,
    emitDecoratorMetadata: true,
    target: ScriptTarget.ES5,
    typeRoots: resolveTypeRoots(),
    jsx: JsxEmit.Preserve,
    allowJs: true,
    lib: [
      join(dirname(require.resolve('typescript')), 'lib.es5.d.ts'),
      join(dirname(require.resolve('typescript')), 'lib.es6.d.ts'),
      join(dirname(require.resolve('typescript')), 'lib.dom.d.ts'),
      join(dirname(require.resolve('typescript')), 'lib.scripthost.d.ts'),
      join(dirname(require.resolve('typescript')), 'lib.es2015.d.ts'),
      join(dirname(require.resolve('typescript')), 'lib.esnext.asynciterable.d.ts'),
    ],
    module: ModuleKind.ESNext,
  },
  isTsx = false,
  openPlayground = false,
): void {
  if (process.env.SKIP_VALIDATION) {
    return;
  }

  try {
    const cwd = resolveCallerDirectory();
    const testFile = join(cwd, `test-file.${isTsx ? 'tsx' : 'ts'}`);
    const host = createCompilerHost(options);
    const program = createProgram([testFile], options, {
      ...host,
      getSourceFile: (
        fileName: string,
        languageVersion: ScriptTargetType,
        onError?: (message: string) => void,
        shouldCreateNewSourceFile?: boolean,
      ) => {
        if (fileName === testFile) {
          return createSourceFile(fileName, contents, options.target);
        }

        return host.getSourceFile(fileName, languageVersion, onError, shouldCreateNewSourceFile);
      },
      writeFile() {},
      useCaseSensitiveFileNames() {
        return false;
      },
      getCanonicalFileName(filename) {
        return filename;
      },
      getCurrentDirectory() {
        return cwd;
      },
      getNewLine() {
        return '\n';
      },
    });
    const emitResult = program.emit();
    const allDiagnostics = emitResult.diagnostics;
    const errors: string[] = [];

    for (const diagnostic of allDiagnostics) {
      if (diagnostic.file) {
        const { line, character } = diagnostic.file.getLineAndCharacterOfPosition(diagnostic.start);
        const message = flattenDiagnosticMessageText(diagnostic.messageText, '\n');
        errors.push(`${line + 1},${character + 1}: ${message} ->
  ${contents.split('\n')[line]}`);
      } else {
        errors.push(String(flattenDiagnosticMessageText(diagnostic.messageText, '\n')));
      }
    }

    const relevantErrors = errors.filter(e => !e.includes('Cannot find module'));

    if (relevantErrors && relevantErrors.length > 0) {
      throw new Error(relevantErrors.join('\n'));
    }
  } catch (e: any) {
    if (openPlayground) {
      const compressedCode = LZString.compressToEncodedURIComponent(contents);
      open('http://www.typescriptlang.org/play/#code/' + compressedCode);
    }

    throw e;
  }
}

/**
 * Resolve the directory of the test file currently being run.
 *
 * The file these helpers type-check exists only in memory, but TypeScript still needs a real
 * directory to anchor Node module resolution to. `process.cwd()` is not usable: it is the repo
 * root, and under pnpm's isolated layout a package's dependencies live in that package's own
 * `node_modules`.
 */
const resolveCallerDirectory = (): string => {
  const testPath = expect.getState().testPath;

  return testPath ? dirname(testPath) : process.cwd();
};

/**
 * Resolve the `@types` directory that actually contains `@types/node`.
 *
 * This used to be derived from `require.resolve('typescript')` as
 * `<ts>/lib/../../../@types`, which only lands on `node_modules/@types` in a flat
 * (npm/yarn) layout. Under pnpm's default isolated layout `require.resolve` returns the
 * realpath inside the virtual store, so it pointed at
 * `node_modules/.pnpm/typescript@<version>/node_modules/@types` -- a directory that does
 * not exist -- and no ambient typings were ever loaded.
 *
 * Locating the directory from `@types/node` itself keeps it correct under every layout.
 */
const resolveTypeRoots = (): string[] => {
  // A `typeRoots` entry is a *container* directory, not a type package: TypeScript resolves
  // every name in `types` as `<typeRoot>/<name>`, so `types: ['node']` looks for
  // `<typeRoot>/node`. Hence two steps up from the manifest -- to the package, then to the
  // `@types` directory holding it.
  const nodeTypesPackageDir = dirname(require.resolve('@types/node/package.json')); // <..>/@types/node
  return [dirname(nodeTypesPackageDir)]; // <..>/@types
};
