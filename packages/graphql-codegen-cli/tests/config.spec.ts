import { createContext, ensureContext } from '../src/index.js';

describe('Codegen config - Context', () => {
  it('loads and merge multiple schemas when using GraphQL config', async () => {
    const context = await createContext({
      config: './packages/graphql-codegen-cli/tests/test-files/graphql.config.js',
      project: 'prj1',
      errorsOnly: true,
      overwrite: true,
      profile: true,
      require: [],
      silent: false,
      watch: false,
    });

    const schema1 = /* GraphQL */ `
      type Query
      scalar Date
    `;

    const schema2 = /* GraphQL */ `
      extend type Query {
        me: User
      }
      type User {
        id: ID!
        name: String!
        createdAt: Date!
      }
    `;

    const schema3 = /* GraphQL */ `
      extend type Query {
        media: Media
      }
      interface Media {
        id: ID!
      }
      type Image implements Media {
        id: ID!
        url: String!
      }
      type Book implements Media {
        id: ID!
        title: String!
      }
    `;

    const mergedSchema = await context.loadSchema([schema1, schema2, schema3]);

    const typeMap = mergedSchema.getTypeMap();

    expect(typeMap['Query']).toBeDefined();
    expect(typeMap['Date']).toBeDefined();
    expect(typeMap['User']).toBeDefined();
    expect(typeMap['Media']).toBeDefined();
    expect(typeMap['Image']).toBeDefined();
    expect(typeMap['Book']).toBeDefined();
  });

  it('loads and merge multiple schemas when using input config', async () => {
    const context = ensureContext({
      generates: {},
    });

    const schema1 = /* GraphQL */ `
      type Mutation
      scalar DateTime
    `;

    const schema2 = /* GraphQL */ `
      extend type Mutation {
        createUser: User
      }
      type User {
        id: ID!
        createdAt: DateTime!
      }
    `;

    const mergedSchema = await context.loadSchema([schema1, schema2]);

    const typeMap = mergedSchema.getTypeMap();

    expect(typeMap['Mutation']).toBeDefined();
    expect(typeMap['DateTime']).toBeDefined();
    expect(typeMap['User']).toBeDefined();
  });
});
