import * as fs from 'fs';
import { parseBOM } from '../src/loaders/introspection-from-file';

describe('extractDocumentStringFromCodeFile', () => {
  it('file with byte order mask', () => {
    const fileContent = fs.readFileSync(`./tests/test-files/ByteOrderMask.json`).toString();
    return expect(() => parseBOM(fileContent)).not.toThrow();
  });
});
