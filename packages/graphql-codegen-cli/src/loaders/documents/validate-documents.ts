import { validate, GraphQLSchema, GraphQLError, specifiedRules } from 'graphql';
import { DocumentFile } from 'graphql-codegen-core';
import { cliError } from '../../utils/cli-error';

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

export function checkValidationErrors(loadDocumentErrors: ReadonlyArray<LoadDocumentError>, exitOnError = true): void {
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

    cliError(
      `
        Found ${errorCount} errors.
        GraphQL Code Generator validated your GraphQL documents against the schema.
        Please fix following errors and run codegen again:
        ${errors.join('')}

      `,
      exitOnError
    );
  }
}
