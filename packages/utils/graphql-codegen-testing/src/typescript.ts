import { Types } from '@graphql-codegen/plugin-helpers';
import * as ts from 'typescript';
import * as path from 'path';

export function validateTs(
  pluginOutput: Types.PluginOutput,
  options: ts.CompilerOptions = {
    noEmitOnError: true,
    noImplicitAny: true,
    moduleResolution: ts.ModuleResolutionKind.NodeJs,
    experimentalDecorators: true,
    emitDecoratorMetadata: true,
    target: ts.ScriptTarget.ES5,
    typeRoots: [path.resolve(require.resolve('typescript'), '../../../@types/')],
    jsx: ts.JsxEmit.Preserve,
    allowJs: true,
    lib: [
      path.join(path.dirname(require.resolve('typescript')), 'lib.es5.d.ts'),
      path.join(path.dirname(require.resolve('typescript')), 'lib.es6.d.ts'),
      path.join(path.dirname(require.resolve('typescript')), 'lib.dom.d.ts'),
      path.join(path.dirname(require.resolve('typescript')), 'lib.scripthost.d.ts'),
      path.join(path.dirname(require.resolve('typescript')), 'lib.es2015.d.ts'),
      path.join(path.dirname(require.resolve('typescript')), 'lib.esnext.asynciterable.d.ts'),
    ],
    module: ts.ModuleKind.ESNext,
  },
  isTsx = false,
  isStrict = false
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
  const testFile = `test-file.${isTsx ? 'tsx' : 'ts'}`;
  const result = ts.createSourceFile(testFile, contents, ts.ScriptTarget.ES2016, false, isTsx ? ts.ScriptKind.TSX : undefined);

  if (result['parseDiagnostics'] && result['parseDiagnostics'].length > 0) {
    const errors: string[] = [];
    const allDiagnostics: any[] = result['parseDiagnostics'];

    allDiagnostics.forEach(diagnostic => {
      if (diagnostic.file) {
        let { line, character } = diagnostic.file.getLineAndCharacterOfPosition(diagnostic.start!);
        let message = ts.flattenDiagnosticMessageText(diagnostic.messageText, '\n');
        errors.push(`${line + 1},${character + 1}: ${message} ->
    ${contents.split('\n')[line]}`);
      } else {
        errors.push(`${ts.flattenDiagnosticMessageText(diagnostic.messageText, '\n')}`);
      }

      const relevantErrors = errors.filter(e => !e.includes('Cannot find module'));

      if (relevantErrors && relevantErrors.length > 0) {
        throw new Error(relevantErrors.join('\n'));
      }
    });
  }
}

export function compileTs(
  contents: string,
  options: ts.CompilerOptions = {
    noEmitOnError: true,
    noImplicitAny: true,
    moduleResolution: ts.ModuleResolutionKind.NodeJs,
    experimentalDecorators: true,
    emitDecoratorMetadata: true,
    target: ts.ScriptTarget.ES5,
    typeRoots: [path.resolve(require.resolve('typescript'), '../../../@types/')],
    jsx: ts.JsxEmit.Preserve,
    allowJs: true,
    lib: [
      path.join(path.dirname(require.resolve('typescript')), 'lib.es5.d.ts'),
      path.join(path.dirname(require.resolve('typescript')), 'lib.es6.d.ts'),
      path.join(path.dirname(require.resolve('typescript')), 'lib.dom.d.ts'),
      path.join(path.dirname(require.resolve('typescript')), 'lib.scripthost.d.ts'),
      path.join(path.dirname(require.resolve('typescript')), 'lib.es2015.d.ts'),
      path.join(path.dirname(require.resolve('typescript')), 'lib.esnext.asynciterable.d.ts'),
    ],
    module: ts.ModuleKind.ESNext,
  },
  isTsx = false
): void {
  if (process.env.SKIP_VALIDATION) {
    return;
  }

  const testFile = `test-file.${isTsx ? 'tsx' : 'ts'}`;
  const host = ts.createCompilerHost(options);
  let program = ts.createProgram([testFile], options, {
    ...host,
    getSourceFile: (fileName: string, languageVersion: ts.ScriptTarget, onError?: (message: string) => void, shouldCreateNewSourceFile?: boolean) => {
      if (fileName === testFile) {
        return ts.createSourceFile(fileName, contents, options.target);
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
  let emitResult = program.emit();
  let allDiagnostics = emitResult.diagnostics;
  const errors: string[] = [];

  allDiagnostics.forEach(diagnostic => {
    if (diagnostic.file) {
      let { line, character } = diagnostic.file.getLineAndCharacterOfPosition(diagnostic.start!);
      let message = ts.flattenDiagnosticMessageText(diagnostic.messageText, '\n');
      errors.push(`${line + 1},${character + 1}: ${message} ->
  ${contents.split('\n')[line]}`);
    } else {
      errors.push(`${ts.flattenDiagnosticMessageText(diagnostic.messageText, '\n')}`);
    }
  });

  const relevantErrors = errors.filter(e => !e.includes('Cannot find module'));

  if (relevantErrors && relevantErrors.length > 0) {
    throw new Error(relevantErrors.join('\n'));
  }
}
