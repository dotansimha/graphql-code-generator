import { SchemaFromString } from '../src/loaders/schema/schema-from-string';

describe('Schema From String', () => {
  const instance = new SchemaFromString();

  it('should not load the schema when an input is a file', async () => {
    const paths = ['./file.js', 'file.js', './dir/*.js'];

    for (const input of paths) {
      expect(instance.canHandle(input)).toEqual(false);
    }
  });

  it('should load the schema when an input is a string and not a filepath or glob', async () => {
    expect(
      instance.canHandle(`
        scalar DateTime
      `)
    ).toEqual(true);
  });
});
