import { Types } from '@graphql-codegen/plugin-helpers';
import { CompilerOptions, ModuleResolutionKind, ScriptTarget, JsxEmit, ModuleKind, createSourceFile, ScriptKind, flattenDiagnosticMessageText, createCompilerHost, createProgram, Diagnostic } from 'typescript';
import { resolve, join, dirname } from 'path';
import open from 'open';

const { compressToEncodedURIComponent } = require('lz-string');

export function validateTs(
  pluginOutput: Types.PluginOutput,
  options: CompilerOptions = {
    noEmitOnError: true,
    noImplicitAny: true,
    moduleResolution: ModuleResolutionKind.NodeJs,
    experimentalDecorators: true,
    emitDecoratorMetadata: true,
    target: ScriptTarget.ES5,
    typeRoots: [resolve(require.resolve('typescript'), '../../../@types/')],
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
  isStrict = false,
  openPlayground = false
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

  const contents: string = typeof pluginOutput === 'string' ? pluginOutput : [...(pluginOutput.prepend || []), pluginOutput.content, ...(pluginOutput.append || [])].join('\n');

  try {
    const testFile = `test-file.${isTsx ? 'tsx' : 'ts'}`;
    const result = createSourceFile(testFile, contents, ScriptTarget.ES2016, false, isTsx ? ScriptKind.TSX : undefined) as { parseDiagnostics?: Diagnostic[] };

    const allDiagnostics = result.parseDiagnostics;

    if (allDiagnostics && allDiagnostics.length > 0) {
      const errors: string[] = [];

      allDiagnostics.forEach(diagnostic => {
        if (diagnostic.file) {
          const { line, character } = diagnostic.file.getLineAndCharacterOfPosition(diagnostic.start!);
          const message = flattenDiagnosticMessageText(diagnostic.messageText, '\n');
          errors.push(`${line + 1},${character + 1}: ${message} ->
    ${contents.split('\n')[line]}`);
        } else {
          errors.push(`${flattenDiagnosticMessageText(diagnostic.messageText, '\n')}`);
        }

        const relevantErrors = errors.filter(e => !e.includes('Cannot find module'));

        if (relevantErrors && relevantErrors.length > 0) {
          throw new Error(relevantErrors.join('\n'));
        }
      });
    }
  } catch (e) {
    if (openPlayground && !process.env) {
      const compressedCode = compressToEncodedURIComponent(contents);
      open('http://www.typescriptlang.org/play/#code/' + compressedCode);
    }

    throw e;
  }
}

export function compileTs(
  contents: string,
  options: CompilerOptions = {
    noEmitOnError: true,
    noImplicitAny: true,
    moduleResolution: ModuleResolutionKind.NodeJs,
    experimentalDecorators: true,
    emitDecoratorMetadata: true,
    target: ScriptTarget.ES5,
    typeRoots: [resolve(require.resolve('typescript'), '../../../@types/')],
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
  openPlayground = false
): void {
  if (process.env.SKIP_VALIDATION) {
    return;
  }

  try {
    const testFile = `test-file.${isTsx ? 'tsx' : 'ts'}`;
    const host = createCompilerHost(options);
    const program = createProgram([testFile], options, {
      ...host,
      getSourceFile: (fileName: string, languageVersion: ScriptTarget, onError?: (message: string) => void, shouldCreateNewSourceFile?: boolean) => {
        if (fileName === testFile) {
          return createSourceFile(fileName, contents, options.target);
        }

        return host.getSourceFile(fileName, languageVersion, onError, shouldCreateNewSourceFile);
      },
      writeFile: function() {},
      useCaseSensitiveFileNames: function() {
        return false;
      },
      getCanonicalFileName: function(filename) {
        return filename;
      },
      getCurrentDirectory: function() {
        return '';
      },
      getNewLine: function() {
        return '\n';
      },
    });
    const emitResult = program.emit();
    const allDiagnostics = emitResult.diagnostics;
    const errors: string[] = [];

    allDiagnostics.forEach(diagnostic => {
      if (diagnostic.file) {
        const { line, character } = diagnostic.file.getLineAndCharacterOfPosition(diagnostic.start);
        const message = flattenDiagnosticMessageText(diagnostic.messageText, '\n');
        errors.push(`${line + 1},${character + 1}: ${message} ->
  ${contents.split('\n')[line]}`);
      } else {
        errors.push(`${flattenDiagnosticMessageText(diagnostic.messageText, '\n')}`);
      }
    });

    const relevantErrors = errors.filter(e => !e.includes('Cannot find module'));

    if (relevantErrors && relevantErrors.length > 0) {
      throw new Error(relevantErrors.join('\n'));
    }
  } catch (e) {
    if (openPlayground) {
      const compressedCode = compressToEncodedURIComponent(contents);
      open('http://www.typescriptlang.org/play/#code/' + compressedCode);
    }

    throw e;
  }
}
