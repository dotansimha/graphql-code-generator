import { validate, GraphQLSchema, GraphQLError, specifiedRules } from 'graphql';
import { DocumentFile } from 'graphql-codegen-core';

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
