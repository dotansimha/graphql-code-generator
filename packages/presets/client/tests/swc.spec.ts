import { transformFileSync } from '@swc/core';
import * as path from 'path';
import babelPlugin from '../src/babel.js';

describe('client-preset > babelPlugin', () => {
  test('can imports files in the same directory', () => {
    const result = transformFileSync(path.join(__dirname, 'fixtures/simple-uppercase-operation-name.ts'), {
      // plugins: [[babelPlugin, { artifactDirectory: path.join(__dirname, 'fixtures') }]],
      // babelrc: false,
      // configFile: false,
    }).code;
    expect(result).toMatchInlineSnapshot(`
      "import { CFragmentDoc } from "./graphql";
      import { BDocument } from "./graphql";
      import { ADocument } from "./graphql";

      /* eslint-disable @typescript-eslint/ban-ts-comment */
      //@ts-ignore
      import gql from 'gql-tag'; //@ts-ignore

      const A = ADocument; //@ts-ignore

      const B = BDocument; //@ts-ignore

      const C = CFragmentDoc;"
    `);
  });
  // test('can import files in another directory', () => {
  //   const result = transformFileSync(path.join(__dirname, 'fixtures/simple-uppercase-operation-name.ts'), {
  //     plugins: [[babelPlugin, { artifactDirectory: __dirname }]],
  //     babelrc: false,
  //     configFile: false,
  //   }).code;
  //   expect(result).toMatchInlineSnapshot(`
  //     "import { CFragmentDoc } from "../graphql";
  //     import { BDocument } from "../graphql";
  //     import { ADocument } from "../graphql";

  //     /* eslint-disable @typescript-eslint/ban-ts-comment */
  //     //@ts-ignore
  //     import gql from 'gql-tag'; //@ts-ignore

  //     const A = ADocument; //@ts-ignore

  //     const B = BDocument; //@ts-ignore

  //     const C = CFragmentDoc;"
  //   `);
  // });
});
