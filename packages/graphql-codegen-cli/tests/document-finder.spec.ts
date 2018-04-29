import * as fs from 'fs';
import { extractDocumentStringFromCodeFile } from '../src/utils/document-finder';
import { parse } from 'graphql';

describe('extractDocumentStringFromCodeFile', () => {
  it('file with gql and template literal', () => {
    const fileContent = fs.readFileSync('./tests/test-files/1.ts').toString();
    const doc = extractDocumentStringFromCodeFile(fileContent);
    const parsingTest = parse.bind(null, doc);
    expect(doc).toContain('query');
    expect(parsingTest).not.toThrow();
  });

  it('file with gql and string and function use', () => {
    const fileContent = fs.readFileSync('./tests/test-files/2.ts').toString();
    const doc = extractDocumentStringFromCodeFile(fileContent);
    const parsingTest = parse.bind(null, doc);
    expect(doc).toContain('query');
    expect(parsingTest).not.toThrow();
  });

  it('file with simple gql content', () => {
    const fileContent = fs.readFileSync('./tests/test-files/3.graphql').toString();
    const doc = extractDocumentStringFromCodeFile(fileContent);
    const parsingTest = parse.bind(null, doc);

    expect(doc).toContain('query');
    expect(parsingTest).not.toThrow();
  });

  it('file with commented code', () => {
    const fileContent = fs.readFileSync('./tests/test-files/4.ts').toString();
    const doc = extractDocumentStringFromCodeFile(fileContent);
    const parsingTest = parse.bind(null, doc);

    expect(doc).toContain('myQuery2');
    expect(doc).not.toContain('myQuery1');
    expect(doc).not.toContain('myQuery3');
    expect(parsingTest).not.toThrow();
  });

  it('file with gql and template literal in ts/tsx file', () => {
    const fileContent = fs.readFileSync('./tests/test-files/5.tsx').toString();
    const doc = extractDocumentStringFromCodeFile(fileContent);
    const parsingTest = parse.bind(null, doc);

    expect(doc).toContain('query');
    expect(parsingTest).not.toThrow();
  });

  it('file with gql and template literal, with use of string variables', () => {
    const fileContent = fs.readFileSync('./tests/test-files/6.ts').toString();
    const doc = extractDocumentStringFromCodeFile(fileContent);
    const parsingTest = parse.bind(null, doc);

    expect(doc).toContain('query');
    expect(parsingTest).not.toThrow();
  });
});
