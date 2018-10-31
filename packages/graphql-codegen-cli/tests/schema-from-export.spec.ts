import { GraphQLSchema } from 'graphql';
import { SchemaFromExport } from '../src/loaders/schema/schema-from-export';

describe('Schema From Export', () => {
  const instance = new SchemaFromExport();

  it('should load the schema correctly from module.exports', async () => {
    const result: any = await instance.handle('./tests/test-files/loaders/module-exports.js', null, null);
    expect(result instanceof GraphQLSchema).toBeTruthy();
  });

  it('should load the schema correctly from variable export', async () => {
    const result: any = await instance.handle('./tests/test-files/loaders/schema-export.js', null, null);
    expect(result instanceof GraphQLSchema).toBeTruthy();
  });

  it('should load the schema correctly from default export', async () => {
    const result: any = await instance.handle('./tests/test-files/loaders/default-export.js', null, null);
    expect(result instanceof GraphQLSchema).toBeTruthy();
  });

  it('should load the schema correctly from promise export', async () => {
    const result: any = await instance.handle('./tests/test-files/loaders/promise-export.js', null, null);
    expect(result instanceof GraphQLSchema).toBeTruthy();
  });
});
