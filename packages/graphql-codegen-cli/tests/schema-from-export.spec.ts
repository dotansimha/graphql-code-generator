import { schemaFromExport } from '../src/loaders/schema-from-export';
import { GraphQLSchema } from 'graphql';

describe('Schema From Export', () => {
  it('should load the schema correctly from module.exports', async () => {
    const result: any = await schemaFromExport('./tests/test-files/loaders/module-exports.js');
    expect(result instanceof GraphQLSchema).toBeTruthy();
  });

  it('should load the schema correctly from variable export', async () => {
    const result: any = await schemaFromExport('./tests/test-files/loaders/schema-export.js');
    expect(result instanceof GraphQLSchema).toBeTruthy();
  });

  it('should load the schema correctly from default export', async () => {
    const result: any = await schemaFromExport('./tests/test-files/loaders/default-export.js');
    expect(result instanceof GraphQLSchema).toBeTruthy();
  });

  it('should load the schema correctly from promise export', async () => {
    const result: any = await schemaFromExport('./tests/test-files/loaders/promise-export.js');
    expect(result instanceof GraphQLSchema).toBeTruthy();
  });
});
