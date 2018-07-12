import * as fs from 'fs';
import { IntrospectionFromFileLoader } from '../src/loaders/schema/introspection-from-file';

describe('extractDocumentStringFromCodeFile', () => {
  it('file with byte order mask', () => {
    const handler = new IntrospectionFromFileLoader();
    const fileContent = fs.readFileSync(`./tests/test-files/ByteOrderMask.json`).toString();
    return expect(() => handler.parseBOM(fileContent)).not.toThrow();
  });
});
