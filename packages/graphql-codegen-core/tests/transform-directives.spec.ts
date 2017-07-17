import { GraphQLSchema } from 'graphql';
import { makeExecutableSchema } from 'graphql-tools';
import { transformDirectives } from '../src/schema/transform-directives';

describe('transformDirectives', () => {
  it('should return the correct transformation for default GraphQL directives', () => {
    const typeDefs = `
      type Query {
        test: String
      }
    `;
    const schema = makeExecutableSchema({ typeDefs, resolvers: {}, allowUndefinedInResolve: true }) as GraphQLSchema;
    const directives = transformDirectives(schema, schema.getDirectives());

    expect(directives.length).toBe(3);
    expect(directives[0].name).toBe('skip');
    expect(directives[1].name).toBe('include');
    expect(directives[2].name).toBe('deprecated');
  });

  it('should return the correct transformation with custom directive', () => {
    const typeDefs = `
      type Query {
        test: String
      }
      
      directive @mydir on FIELD_DEFINITION
    `;
    const schema = makeExecutableSchema({ typeDefs, resolvers: {}, allowUndefinedInResolve: true }) as GraphQLSchema;
    const directives = transformDirectives(schema, schema.getDirectives());

    expect(directives.length).toBe(4);
    expect(directives[0].name).toBe('mydir');
    expect(directives[0].arguments.length).toBe(0);
    expect(directives[0].description).toBe('');
    expect(directives[0].locations.length).toBe(1);
    expect(directives[0].onFieldDefinition).toBe(true);
    expect(directives[1].name).toBe('skip');
    expect(directives[2].name).toBe('include');
    expect(directives[3].name).toBe('deprecated');
  });
  it('should return the correct transformation with custom directive with args', () => {
    const typeDefs = `
      type Query {
        test: String
      }
      
      directive @mydir(t: Int!) on FIELD_DEFINITION
    `;
    const schema = makeExecutableSchema({ typeDefs, resolvers: {}, allowUndefinedInResolve: true }) as GraphQLSchema;
    const directives = transformDirectives(schema, schema.getDirectives());

    expect(directives.length).toBe(4);
    expect(directives[0].name).toBe('mydir');
    expect(directives[0].arguments.length).toBe(1);
    expect(directives[0].arguments[0].name).toBe('t');
    expect(directives[0].arguments[0].type).toBe('Int');
    expect(directives[0].arguments[0].isArray).toBeFalsy();
    expect(directives[0].arguments[0].isRequired).toBeTruthy();
    expect(directives[0].description).toBe('');
    expect(directives[0].locations.length).toBe(1);
    expect(directives[0].onFieldDefinition).toBe(true);
    expect(directives[1].name).toBe('skip');
    expect(directives[2].name).toBe('include');
    expect(directives[3].name).toBe('deprecated');
  });
});
