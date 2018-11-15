import { SchemaFromTypedefs } from '../src/loaders/schema/schema-from-typedefs';

describe('schema from typedefs', () => {
  it('should work with glob correctly', () => {
    const glob = './tests/test-files/schema-dir/*.graphql';
    const handler = new SchemaFromTypedefs();
    const canHandle = handler.canHandle(glob);
    expect(canHandle).toBeTruthy();
    const built = handler.handle(glob, {} as any, null);
    expect(built.getTypeMap()['User']).toBeDefined();
    expect(built.getTypeMap()['Query']).toBeDefined();
  });

  it('should work with import notations', () => {
    const schemaPath = './tests/test-files/schema-dir/query.graphql';
    const handler = new SchemaFromTypedefs();
    const canHandle = handler.canHandle(schemaPath);
    expect(canHandle).toBeTruthy();
    const built = handler.handle(schemaPath, {} as any, null);
    expect(built.getTypeMap()['User']).toBeDefined();
    expect(built.getTypeMap()['Query']).toBeDefined();
  });
});
