import '@graphql-codegen/testing';
import { buildSchema } from 'graphql';
import { plugin } from '../src/index';
import { validateJava } from '../../common/tests/validate-java';

const OUTPUT_FILE = 'com/java/generated/resolvers.java';

describe('Java Resolvers', () => {
  const schema = buildSchema(/* GraphQL */ `
    scalar DateTime

    type Query {
      me: User!
    }

    interface Node {
      id: ID!
    }

    type User implements Node {
      id: ID!
      username: String!
      email: String!
      name: String
      dateOfBirth: DateTime
    }

    type Chat implements Node {
      id: ID!
      users: [User!]!
      title: String
    }

    union SearchResult = Chat | User
  `);

  it('Should generate interfaces correctly', async () => {
    const result = await plugin(schema, [], {}, { outputFile: OUTPUT_FILE });

    expect(result).toBeSimilarStringTo(`
    public interface Query {
      public DataFetcher<Object> me();
    }`);
    expect(result).toBeSimilarStringTo(`
    public interface User {
      public DataFetcher<Object> id();
      public DataFetcher<String> username();
      public DataFetcher<String> email();
      public DataFetcher<String> name();
      public DataFetcher<Object> dateOfBirth();
    }`);

    validateJava(result as any);
  });

  it('Should generate list types correctly', async () => {
    const result = await plugin(schema, [], {}, { outputFile: OUTPUT_FILE });

    expect(result).toBeSimilarStringTo(`public interface Chat {
      public DataFetcher<Object> id();
      public DataFetcher<Iterable<Object>> users();
      public DataFetcher<String> title();
    }`);
  });

  it('Should generate neseted list types correctly', async () => {
    const result = await plugin(buildSchema(`type Query { data: [[[[String]]]]}`), [], {}, { outputFile: OUTPUT_FILE });

    expect(result).toBeSimilarStringTo(`public DataFetcher<Iterable<Iterable<Iterable<Iterable<String>>>>> data();`);
  });

  it('Should generate union correctly', async () => {
    const result = await plugin(schema, [], {}, { outputFile: OUTPUT_FILE });

    expect(result).toBeSimilarStringTo(`public interface SearchResult extends TypeResolver {

    }`);
  });

  it('Should generate interfaces correctly and add the correct imports', async () => {
    const result = await plugin(schema, [], {}, { outputFile: OUTPUT_FILE });

    expect(result).toContain(`import graphql.schema.TypeResolver;`);
    expect(result).toBeSimilarStringTo(`
    public interface Node extends TypeResolver {
      default public DataFetcher<Object> id() { return null; }
    }`);
  });

  it('Should use the correct package name by default', async () => {
    const result = await plugin(schema, [], {}, { outputFile: OUTPUT_FILE });

    expect(result).toContain(`package com.java.generated;`);
  });

  it('Should use the package name provided from the config', async () => {
    const result = await plugin(schema, [], { package: 'com.my.package' }, { outputFile: OUTPUT_FILE });

    expect(result).toContain(`package com.my.package;`);
  });

  it('Should add the correct package value according to the filename', async () => {
    const result = await plugin(schema, [], {}, { outputFile: OUTPUT_FILE });

    expect(result).toBeSimilarStringTo(`
    public interface Query {
      public DataFetcher<Object> me();
    }`);

    expect(result).toBeSimilarStringTo(`
    public interface User {
      public DataFetcher<Object> id();
      public DataFetcher<String> username();
      public DataFetcher<String> email();
      public DataFetcher<String> name();
      public DataFetcher<Object> dateOfBirth();
    }`);
  });
});
