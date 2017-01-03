jest.mock('fs');

import * as fs from 'fs';
import {loadFileContent, loadDocumentsSources} from "../../src/loaders/document-loader";

describe('document-loader', () => {
  beforeAll(() => {
    fs['__setMockFiles']({
      'exists.query.graphql': 'query m { f }',
      'valid.query.graphql': 'query m { f }',
      'invalid.query.graphql': 'query m)( { f }'
    })
  });

  describe('loadDocumentsSources', () => {
    test('should return a valid GraphQL DocumentNode object when using a single path', () => {
      const returnValue = loadDocumentsSources([
        'exists.query.graphql'
      ]);

      expect(returnValue.kind).toEqual('Document');
    });

    test('should return a valid GraphQL DocumentNode object when using a multiple paths', () => {
      const returnValue = loadDocumentsSources([
        'exists.query.graphql',
        'valid.query.graphql'
      ]);

      expect(returnValue.kind).toEqual('Document');
    });

    test('should return a valid GraphQL DocumentNode will the correct amount of selectionSet', () => {
      const paths = [
        'exists.query.graphql',
        'valid.query.graphql'
      ];
      const returnValue = loadDocumentsSources(paths);

      expect(returnValue.definitions.length).toEqual(paths.length);
    });

    test('should throw a exception when one of the paths does not exists', () => {
      expect(() => {
        loadDocumentsSources([
          'exists.query.graphql',
          'error.query.graphql'
        ]);
      }).toThrow();
    });

    test('should throw a exception when one of the paths is invalid GraphQL document', () => {
      expect(() => {
        loadDocumentsSources([
          'exists.query.graphql',
          'invalid.query.graphql'
        ]);
      }).toThrow();
    });
  });

  describe('loadFileContent', () => {
    test('should throw an exception when file does not exists', () => {
      expect(() => {
        loadFileContent('error.query.graphql');
      }).toThrow();
    });

    test('should not throw an exception when file exists', () => {
      expect(() => {
        loadFileContent('exists.query.graphql');
      }).not.toThrow();
    });

    test('should return a valid GraphQL DocumentNode object', () => {
      const returnValue = loadFileContent('exists.query.graphql');

      expect(returnValue.kind).toEqual('Document');
    });

    test('should throw an exception when file contains an invalid GraphQL document', () => {
      expect(() => {
        loadFileContent('invalid.query.graphql');
      }).toThrow();
    });
  });
});
