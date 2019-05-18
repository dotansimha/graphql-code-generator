import { sortPrependValues } from '../src/codegen';
describe('sortPrependValues', () => {
  it('Should sort and use the correct order', () => {
    const strings: string[] = [`import `, '/* comment */', `// This is a comment`];

    const sorted = sortPrependValues(strings);

    expect(sorted).toEqual(['/* comment */', `// This is a comment`, `import `]);
  });
});
