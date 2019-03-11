import * as ts from 'typescript';
import * as fs from 'fs';
import * as path from 'path';

export function validateTs(
  contents: string,
  options: ts.CompilerOptions = {
    noEmitOnError: true,
    noImplicitAny: true,
    moduleResolution: ts.ModuleResolutionKind.NodeJs,
    experimentalDecorators: true,
    emitDecoratorMetadata: true,
    target: ts.ScriptTarget.ES5,
    typeRoots: [path.resolve(require.resolve('typescript'), '../../../@types/')],
    lib: [
      path.join(path.dirname(require.resolve('typescript')), 'lib.es5.d.ts'),
      path.join(path.dirname(require.resolve('typescript')), 'lib.dom.d.ts'),
      path.join(path.dirname(require.resolve('typescript')), 'lib.scripthost.d.ts'),
      path.join(path.dirname(require.resolve('typescript')), 'lib.es2015.d.ts'),
      path.join(path.dirname(require.resolve('typescript')), 'lib.esnext.asynciterable.d.ts')
    ],
    module: ts.ModuleKind.CommonJS
  }
): void {
  const host = ts.createCompilerHost(options);
  let program = ts.createProgram(['test-file.ts'], options, {
    ...host,
    getSourceFile: (
      fileName: string,
      languageVersion: ts.ScriptTarget,
      onError?: (message: string) => void,
      shouldCreateNewSourceFile?: boolean
    ) => {
      if (fileName === 'test-file.ts') {
        return ts.createSourceFile(fileName, contents, options.target);
      }

      return host.getSourceFile(fileName, languageVersion, onError, shouldCreateNewSourceFile);
    },
    writeFile: function(name, text, writeByteOrderMark) {},
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
    }
  });
  let emitResult = program.emit();
  let allDiagnostics = emitResult.diagnostics;
  const errors = [];

  allDiagnostics.forEach(diagnostic => {
    if (diagnostic.file) {
      let { line, character } = diagnostic.file.getLineAndCharacterOfPosition(diagnostic.start!);
      let message = ts.flattenDiagnosticMessageText(diagnostic.messageText, '\n');
      errors.push(`${line + 1},${character + 1}: ${message}`);
    } else {
      errors.push(`${ts.flattenDiagnosticMessageText(diagnostic.messageText, '\n')}`);
    }
  });

  const relevantErrors = errors.filter(e => !e.includes('Cannot find module'));

  if (relevantErrors && relevantErrors.length > 0) {
    throw new Error(relevantErrors.join('\n'));
  }
}
