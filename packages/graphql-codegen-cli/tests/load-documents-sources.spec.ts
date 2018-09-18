import { makeExecutableSchema } from 'graphql-tools';
import { join } from 'path';
import { readFileSync } from 'fs';
import { LoadDocumentError, loadDocumentsSources } from '../src/loaders/documents/document-loader';
import { GraphQLError } from 'graphql';

describe('loadDocumentsSources', () => {
  const schema = makeExecutableSchema({
    typeDefs: readFileSync(join(__dirname, './test-documents/schema.graphql'), { encoding: 'utf-8' }),
    allowUndefinedInResolve: true
  });

  it('should return a valid DocumentNode when document is valid', () => {
    const documentPath = join(__dirname, './test-documents/valid.graphql');
    const result = loadDocumentsSources(schema, [documentPath]);
    expect(Array.isArray(result)).toBeFalsy();
    expect(result['kind']).toBe('Document');
  });

  it('should return an error array when document is invalid', () => {
    const documentPath = join(__dirname, './test-documents/invalid-fields.graphql');
    const result = loadDocumentsSources(schema, [documentPath]);
    expect(Array.isArray(result)).toBeTruthy();
    const errors = result as ReadonlyArray<LoadDocumentError>;
    expect(errors[0].filePath).toBe(documentPath);
    expect(errors[0].errors.length).toBe(1);
    expect(errors[0].errors[0] instanceof GraphQLError).toBeTruthy();
    expect(errors[0].errors[0].message).toContain('Cannot query field "fieldD" on type "Query"');
  });

  it('should return an error array when one of the documents is invalid', () => {
    const documentPath1 = join(__dirname, './test-documents/valid.graphql');
    const documentPath2 = join(__dirname, './test-documents/invalid-fields.graphql');
    const result = loadDocumentsSources(schema, [documentPath1, documentPath2]);
    expect(Array.isArray(result)).toBeTruthy();
    const errors = result as ReadonlyArray<LoadDocumentError>;
    expect(errors[0].filePath).toBe(documentPath2);
    expect(errors[0].errors.length).toBe(1);
    expect(errors[0].errors[0] instanceof GraphQLError).toBeTruthy();
    expect(errors[0].errors[0].message).toContain('Cannot query field "fieldD" on type "Query"');
  });
});
