import { validate, GraphQLSchema, GraphQLError, specifiedRules } from 'graphql';
import { DocumentNode, Source, parse, concatAST } from 'graphql-codegen-core';
import * as fs from 'fs';
import * as path from 'path';
import { extractDocumentStringFromCodeFile } from '../../utils/document-finder';

export const loadFileContent = (filePath: string): DocumentNode | null => {
  if (fs.existsSync(filePath)) {
    const fileContent = fs.readFileSync(filePath, 'utf8');
    const fileExt = path.extname(filePath);

    if (fileExt === '.graphql' || fileExt === '.gql') {
      return parse(new Source(fileContent, filePath));
    }

    const foundDoc = extractDocumentStringFromCodeFile(fileContent);

    if (foundDoc) {
      return parse(new Source(foundDoc, filePath));
    } else {
      return null;
    }
  } else {
    throw new Error(`Document file ${filePath} does not exists!`);
  }
};

const effectiveRules = specifiedRules.filter((f: Function) => f.name !== 'NoUnusedFragments');

export interface LoadDocumentError {
  readonly filePath: string;
  readonly errors: ReadonlyArray<GraphQLError>;
}

export const loadDocumentsSources = (
  schema: GraphQLSchema,
  filePaths: string[]
): DocumentNode | ReadonlyArray<LoadDocumentError> => {
  const loadResults = filePaths
    .map(filePath => ({ filePath, content: loadFileContent(filePath) }))
    .filter(result => result.content);
  const errors: ReadonlyArray<LoadDocumentError> = loadResults
    .map(result => ({
      filePath: result.filePath,
      errors: validate(schema, result.content, effectiveRules)
    }))
    .filter(r => r.errors.length > 0);
  return errors.length > 0 ? errors : concatAST(loadResults.map(r => r.content));
};
