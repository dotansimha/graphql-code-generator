import { makeExecutableSchema } from 'graphql-tools';
import { schemaToTemplateContext } from '../src/schema/schema-to-template-context';
import { GraphQLSchema } from 'graphql';

describe('schemaToTemplateContext', () => {
  it('should return the correct result when only Query defined', () => {
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

  it('should pass GraphQL error when schema is not valid', () => {
    const typeDefs = `
      type Query {
        test: C
      }
    `;

    expect(() => {
      const schema = makeExecutableSchema({ typeDefs, resolvers: {}, allowUndefinedInResolve: true }) as GraphQLSchema;
      const context = schemaToTemplateContext(schema);
    }).toThrow();
  });

  it('should return the correct result when Query and Mutation defined', () => {
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

  it('should return the correct result when custom type is defined', () => {
    const typeDefs = `
      type Query {
        test: CustomType
      }
      
      type CustomType {
        fieldA: String
        fieldB: Int
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

  it('should return the correct result when using interface', () => {
    const typeDefs = `
      type Query {
        test: CustomType
      }
      
      interface Base {
        fieldA: String
      }
      
      type CustomType implements Base {
        fieldA: String
        fieldB: Int
      }
    `;
    const schema = makeExecutableSchema({ typeDefs, resolvers: {}, allowUndefinedInResolve: true }) as GraphQLSchema;
    const context = schemaToTemplateContext(schema);

    expect(context.types.length).toBe(2);
    expect(context.interfaces.length).toBe(1);
    expect(context.enums.length).toBe(0);
    expect(context.inputTypes.length).toBe(0);
    expect(context.scalars.length).toBe(0);
    expect(context.unions.length).toBe(0);
  });

  it('should return the correct result when using unions', () => {
    const typeDefs = `
      type Query {
        test: U
      }
      
      type A {
        test: String
      }
      
      type B {
        test: String
      }
      
      union U = A | B
    `;
    const schema = makeExecutableSchema({ typeDefs, resolvers: {}, allowUndefinedInResolve: true }) as GraphQLSchema;
    const context = schemaToTemplateContext(schema);

    expect(context.types.length).toBe(3);
    expect(context.interfaces.length).toBe(0);
    expect(context.enums.length).toBe(0);
    expect(context.inputTypes.length).toBe(0);
    expect(context.scalars.length).toBe(0);
    expect(context.unions.length).toBe(1);
  });

  it('should return the correct result when using enum', () => {
    const typeDefs = `
      type Query {
        test: E
      }
      
      enum E {
        A
        B
        C
      }
    `;
    const schema = makeExecutableSchema({ typeDefs, resolvers: {}, allowUndefinedInResolve: true }) as GraphQLSchema;
    const context = schemaToTemplateContext(schema);

    expect(context.types.length).toBe(1);
    expect(context.interfaces.length).toBe(0);
    expect(context.enums.length).toBe(1);
    expect(context.inputTypes.length).toBe(0);
    expect(context.scalars.length).toBe(0);
    expect(context.unions.length).toBe(0);
  });

  it('should return the correct result when using scalar', () => {
    const typeDefs = `
      type Query {
        test: Date
      }
      
      scalar Date
    `;
    const schema = makeExecutableSchema({ typeDefs, resolvers: {}, allowUndefinedInResolve: true }) as GraphQLSchema;
    const context = schemaToTemplateContext(schema);

    expect(context.types.length).toBe(1);
    expect(context.interfaces.length).toBe(0);
    expect(context.enums.length).toBe(0);
    expect(context.inputTypes.length).toBe(0);
    expect(context.scalars.length).toBe(1);
    expect(context.unions.length).toBe(0);
  });

  it('should return the correct result when using input type', () => {
    const typeDefs = `
      type Query {
        test(argument: Input): Int
      }
      
      input Input {
        f: String
      }
    `;
    const schema = makeExecutableSchema({ typeDefs, resolvers: {}, allowUndefinedInResolve: true }) as GraphQLSchema;
    const context = schemaToTemplateContext(schema);

    expect(context.types.length).toBe(1);
    expect(context.interfaces.length).toBe(0);
    expect(context.enums.length).toBe(0);
    expect(context.inputTypes.length).toBe(1);
    expect(context.scalars.length).toBe(0);
    expect(context.unions.length).toBe(0);
  });
});
