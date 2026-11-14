import { sortPrependValues } from '../src/codegen.js';

describe('sortPrependValues', () => {
  it('Should sort and use the correct order', () => {
    const strings: string[] = [`import `, '/* comment */', `// This is a comment`];

    const sorted = sortPrependValues(strings);

    expect(sorted).toEqual(['/* comment */', `// This is a comment`, `import `]);
  });

  it('Should not sort utility types with leading JSDoc comments before import statements', () => {
    const strings: string[] = [
      '/** Internal type. DO NOT USE DIRECTLY. */\ntype Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };',
      'import { something } from "./somewhere";',
      '/* banner comment */',
      '/** Internal type. DO NOT USE DIRECTLY. */\nexport type Incremental<T> = T;',
    ];

    const sorted = sortPrependValues(strings);

    expect(sorted).toEqual([
      '/* banner comment */',
      'import { something } from "./somewhere";',
      '/** Internal type. DO NOT USE DIRECTLY. */\ntype Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };',
      '/** Internal type. DO NOT USE DIRECTLY. */\nexport type Incremental<T> = T;',
    ]);
  });
});
