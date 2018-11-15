import { validate, GraphQLSchema, GraphQLError, specifiedRules } from 'graphql';
import { DocumentFile } from 'graphql-codegen-core';
import { DetailedError } from '../../errors';

const rulesToIgnore = ['KnownFragmentNames', 'NoUnusedFragments', 'NoUnusedVariables', 'KnownDirectives'];
const effectiveRules = specifiedRules.filter((f: Function) => !rulesToIgnore.includes(f.name));

export interface LoadDocumentError {
  readonly filePath: string;
  readonly errors: ReadonlyArray<GraphQLError>;
}

export const validateGraphQlDocuments = (
  schema: GraphQLSchema,
  documentFiles: DocumentFile[]
): ReadonlyArray<LoadDocumentError> =>
  documentFiles
    .map(result => ({
      filePath: result.filePath,
      errors: validate(schema, result.content, effectiveRules)
    }))
    .filter(r => r.errors.length > 0);

export function checkValidationErrors(loadDocumentErrors: ReadonlyArray<LoadDocumentError>): void | never {
  if (loadDocumentErrors.length > 0) {
    const errors: string[] = [];
    let errorCount = 0;

    for (const loadDocumentError of loadDocumentErrors) {
      for (const graphQLError of loadDocumentError.errors) {
        errors.push(`
          ${loadDocumentError.filePath}: 
            ${graphQLError.message}
        `);
        errorCount++;
      }
    }

    throw new DetailedError(
      `Found ${errorCount} errors in your documents`,
      `
      Found ${errorCount} errors.
      GraphQL Code Generator validated your GraphQL documents against the schema.
      Please fix following errors and run codegen again:
      ${errors.join('')}

    `
    );
  }
}
