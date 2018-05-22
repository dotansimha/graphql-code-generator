import * as fs from 'fs';
import { parse } from 'graphql';
import { Source } from 'graphql-codegen-core';

import { extractDocumentStringFromCodeFile } from '../src/utils/document-finder';

describe('extractDocumentStringFromCodeFile', () => {
  function extract(fileName: string) {
    const fileContent = fs.readFileSync(`./tests/test-files/${fileName}`).toString();
    const doc = extractDocumentStringFromCodeFile(fileContent);
    expect(tryParse(doc)).not.toThrow();
    return doc.trim();
  }

  function tryParse(doc: string) {
    return () => parse(new Source(doc));
  }

  it('file with gql and template literal', () => {
    const doc = extract('1.ts');
    const graphql = extract('7.ts');
    expect(doc).toEqual(graphql);
    expect(doc).toMatchSnapshot();
  });

  it('file with gql and string and function use', () => {
    const doc = extract('2.ts');
    const graphql = extract('8.ts');
    expect(doc).toEqual(graphql);
    expect(doc).toMatchSnapshot();
  });

  it('file with simple gql content', () => {
    const doc = extract('3.graphql');
    expect(doc).toMatchSnapshot();
  });

  it('file with commented code', () => {
    const doc = extract('4.ts');
    const graphql = extract('9.ts');
    expect(doc).toEqual(graphql);
    expect(doc).toMatchSnapshot();
  });

  it('file with gql and template literal in ts/tsx file', () => {
    const doc = extract('5.tsx');
    const graphql = extract('10.tsx');
    expect(doc).toEqual(graphql);
    expect(doc).toMatchSnapshot();
  });

  it('file with gql and template literal, with use of string variables', () => {
    const doc = extract('6.ts');
    const graphql = extract('11.ts');
    expect(doc).toEqual(graphql);
    expect(doc).toMatchSnapshot();
  });
});
