import * as fs from 'fs';
import stripComments from '../src/utils/strip-comments';

describe('stripComments', () => {
  function strip(fileName: string) {
    const fileContent = fs.readFileSync(`./tests/test-files/${fileName}`).toString();
    const doc = stripComments(fileContent, { sourceType: 'module' });
    return doc;
  }

  it('file with jsx and typescript, query in comments', () => {
    const doc = strip('12.tsx');
    expect(doc).toMatchSnapshot();
  });
});
