import { makeExecutableSchema } from 'graphql-tools';
import { schemaToTemplateContext } from '../src/schema/schema-to-template-context';
import { GraphQLSchema } from 'graphql';

describe('schemaToTemplateContext', () => {
  it('should return the correct types array when only Query defined', () => {
    const typeDefs = `
      type Query {
        test: String
      }
    `;
    const schema = makeExecutableSchema({ typeDefs, resolvers: {}, allowUndefinedInResolve: true }) as GraphQLSchema;
    const context = schemaToTemplateContext(schema);

    expect(context.types.length).toBe(1);
    expect(context.interfaces.length).toBe(0);
    expect(context.enums.length).toBe(0);
    expect(context.inputTypes.length).toBe(0);
    expect(context.scalars.length).toBe(0);
    expect(context.unions.length).toBe(0);
  });

  it('should return the correct types array when Query and Mutation defined', () => {
    const typeDefs = `
      type Query {
        test: String
      }
      
      type Mutation {
        test: String
      }
    `;
    const schema = makeExecutableSchema({ typeDefs, resolvers: {}, allowUndefinedInResolve: true }) as GraphQLSchema;
    const context = schemaToTemplateContext(schema);

    expect(context.types.length).toBe(2);
    expect(context.interfaces.length).toBe(0);
    expect(context.enums.length).toBe(0);
    expect(context.inputTypes.length).toBe(0);
    expect(context.scalars.length).toBe(0);
    expect(context.unions.length).toBe(0);
  });
});
