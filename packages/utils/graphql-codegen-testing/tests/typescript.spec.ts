import { describe, expect, it } from 'vitest';
import { validateTs } from '../src/typescript.js';

describe('validateTs default compiler options', () => {
  // `validateTs` derives `typeRoots` from `require.resolve('typescript')`, which assumes a flat
  // (npm/yarn) node_modules layout. Under pnpm's default isolated layout that path lands inside
  // the virtual store -- `node_modules/.pnpm/typescript@<version>/node_modules/@types` -- which
  // never contains `@types/node`, so no ambient Node typings are ever loaded.
  //
  // This is what forced `options.types ||= ['node']` to be commented out in src/typescript.ts
  // with a FIXME(pnpm-update): requesting the `node` type package from a non-existent typeRoot
  // fails with "Cannot find type definition file for 'node'".
  //
  // Passing `undefined` for `options` is load-bearing -- it is what makes `validateTs` fall back
  // to the default compiler options this test is about. `compileProgram` must be `true`, since
  // the default path only collects parse diagnostics and never type-checks at all.
  it('resolves @types/node so Node globals type-check', () => {
    const content = `const cwd: string = process.cwd();\nexport { cwd };\n`;

    let message: string | undefined;
    try {
      validateTs(content, undefined, false, false, [], true);
    } catch (error) {
      message = error instanceof Error ? error.message : String(error);
    }

    expect(message).toBeUndefined();
  });
});
