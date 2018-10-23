import { validate, GraphQLSchema, GraphQLError, specifiedRules } from 'graphql';
import { DocumentFile } from 'graphql-codegen-core';

const effectiveRules = specifiedRules.filter((f: Function) => f.name !== 'NoUnusedFragments');

export interface LoadDocumentError {
  readonly filePath: string;
  readonly errors: ReadonlyArray<GraphQLError>;
}

const IGNORED_VALIDATION_ERRORS = ['Unknown fragment', 'Unknown directive'];

export const validateGraphQlDocuments = (
  schema: GraphQLSchema,
  documentFiles: DocumentFile[]
): ReadonlyArray<LoadDocumentError> =>
  documentFiles
    .map(result => ({
      filePath: result.filePath,
      errors: validate(schema, result.content, effectiveRules).filter(
        e => !IGNORED_VALIDATION_ERRORS.find(ignoredErr => e.message.indexOf(ignoredErr) > -1)
      )
    }))
    .filter(r => r.errors.length > 0);
