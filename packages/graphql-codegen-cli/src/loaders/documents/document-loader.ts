import { validate, GraphQLSchema, GraphQLError } from 'graphql';
import { DocumentNode, Source, parse, concatAST, logger } from 'graphql-codegen-core';
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

export const loadDocumentsSources = (
  schema: GraphQLSchema,
  filePaths: string[]
): DocumentNode | ReadonlyArray<GraphQLError> => {
  const loadResults = filePaths
    .map(filePath => {
      const fileContent = loadFileContent(filePath);
      if (!fileContent) {
        return {
          fileContent,
          errors: []
        };
      }
      const errors = validate(schema, fileContent);
      return {
        fileContent,
        errors
      };
    })
    .filter(content => content.fileContent);

  const errors = loadResults.map(r => r.errors).reduce((soFar, current) => soFar.concat(current), []);
  return errors.length > 0 ? errors : concatAST(loadResults.map(r => r.fileContent));
};
