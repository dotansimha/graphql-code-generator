import { makeExecutableSchema } from 'graphql-tools';
import { join } from 'path';
import { readFileSync } from 'fs';
import { loadDocumentsSources } from '../src/loaders/documents/document-loader';
import { LoadDocumentError, validateGraphQlDocuments } from '../src/loaders/documents/validate-documents';
import { GraphQLError } from 'graphql';

describe('loadDocumentsSources', () => {
  const schema = makeExecutableSchema({
    typeDefs: readFileSync(join(__dirname, './test-documents/schema.graphql'), { encoding: 'utf-8' }),
    allowUndefinedInResolve: true
  });

  it('should return a valid DocumentNode when document is valid', async () => {
    const documentPath = join(__dirname, './test-documents/valid.graphql');
    const document = await loadDocumentsSources([documentPath]);
    const result = validateGraphQlDocuments(schema, document);
    expect(result.length).toBe(0);
  });

  it('should not throw an exception in case of invalid directive', async () => {
    const documentPath = join(__dirname, './test-documents/invalid-directive.graphql');
    const document = await loadDocumentsSources([documentPath]);
    const result = validateGraphQlDocuments(schema, document);
    expect(result.length).toBe(0);
  });

  it('should return an error array when document is invalid', async () => {
    const documentPath = join(__dirname, './test-documents/invalid-fields.graphql');
    const document = await loadDocumentsSources([documentPath]);
    const errors = validateGraphQlDocuments(schema, document);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0].filePath).toBe(documentPath);
    expect(errors[0].errors.length).toBe(1);
    expect(errors[0].errors[0] instanceof GraphQLError).toBeTruthy();
    expect(errors[0].errors[0].message).toContain('Cannot query field "fieldD" on type "Query"');
  });

  it('should return an error array when one of the documents is invalid', async () => {
    const documentPath1 = join(__dirname, './test-documents/valid.graphql');
    const documentPath2 = join(__dirname, './test-documents/invalid-fields.graphql');
    const document = await loadDocumentsSources([documentPath1, documentPath2]);
    const errors = validateGraphQlDocuments(schema, document);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0].filePath).toBe(documentPath2);
    expect(errors[0].errors.length).toBe(1);
    expect(errors[0].errors[0] instanceof GraphQLError).toBeTruthy();
    expect(errors[0].errors[0].message).toContain('Cannot query field "fieldD" on type "Query"');
  });

  it('should not return an error array when one file references fragment in other file', async () => {
    const documentPath1 = join(__dirname, './test-documents/my-fragment.ts');
    const documentPath2 = join(__dirname, './test-documents/query-with-my-fragment.ts');
    const document = await loadDocumentsSources([documentPath1, documentPath2]);
    const errors = validateGraphQlDocuments(schema, document);
    expect(errors.length).toBe(0);
  });
});
