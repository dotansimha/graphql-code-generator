import { transformFileSync } from '@babel/core';
import * as path from 'path';
import babelPlugin from '../src/babel';

describe('gql-tag-operations-preset > babelPlugin', () => {
  test('can rewrite imports', () => {
    const result = transformFileSync(path.join(__dirname, 'fixtures/simple-uppercase-operation-name.ts'), {
      plugins: [[babelPlugin, { artifactDirectory: path.join(__dirname, 'fixtures') }]],
      babelrc: false,
      configFile: false,
    }).code;
    // TODO: update snapshot once implementation is fixed :)
    expect(result).toMatchInlineSnapshot(`
"import { CFragmentDoc } from \\"./graphql\\";
import { BDocument } from \\"./graphql\\";
import { ADocument } from \\"./graphql\\";

/* eslint-disable @typescript-eslint/no-unused-vars-experimental, @typescript-eslint/ban-ts-comment */
//@ts-ignore
import gql from 'gql-tag'; //@ts-ignore

const A = ADocument; //@ts-ignore

const B = BDocument; //@ts-ignore

const C = CFragmentDoc;"
`);
  });
});
