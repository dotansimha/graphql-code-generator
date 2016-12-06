import {buildClientSchema, GraphQLSchema, IntrospectionQuery} from 'graphql';
import * as fs from 'fs';

export const loadFileContent = (filePath: string): IntrospectionQuery => {
  if (fs.existsSync(filePath)) {
    return <IntrospectionQuery>(JSON.parse(fs.readFileSync(filePath, 'utf8')));
  } else {
    throw new Error(`File ${filePath} does not exists!`);
  }
};


export const validateSchema = (schema: IntrospectionQuery) => {
  if (!schema.__schema) {
    throw new Error('Invalid schema provided!');
  }
};

export const loadSchema = (filePath: string): GraphQLSchema => {
  const schemaObject = loadFileContent(filePath);
  validateSchema(schemaObject);

  return buildClientSchema(schemaObject);
};
