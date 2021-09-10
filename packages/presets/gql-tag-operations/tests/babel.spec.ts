import { transformFileSync } from '@babel/core';
import * as path from 'path';
import babelPlugin from '../src/babel';

describe('gql-tag-operations-preset > babelPlugin', () => {
  test('can do sth', () => {
    const result = transformFileSync(path.join(__dirname, 'fixtures/simple-uppercase-operation-name.ts'), {
      plugins: [[babelPlugin]],
      babelrc: false,
      configFile: false,
    }).code;
    // TODO: update snapshot once implementation is fixed :)
    expect(result).toMatchInlineSnapshot(`
"import { C } from \\"./gql/graphql\\";
import { B } from \\"./gql/graphql\\";
import { A } from \\"./gql/graphql\\";

/* eslint-disable @typescript-eslint/no-unused-vars-experimental, @typescript-eslint/ban-ts-comment */
//@ts-ignore
import gql from 'gql'; //@ts-ignore

const A = A; //@ts-ignore

const B = B; //@ts-ignore

const C = C;"
`);
  });
});
