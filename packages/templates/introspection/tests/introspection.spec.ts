import {
  GeneratorConfig,
  GraphQLSchema,
  makeExecutableSchema,
  SchemaTemplateContext,
  schemaToTemplateContext
} from 'graphql-codegen-core';
import { compileTemplate } from 'graphql-codegen-compiler';
import { introspectionFromSchema } from 'graphql';
import config from '../dist';

describe('Introspection template', () => {
  const compileAndBuildContext = (typeDefs: string): { context: SchemaTemplateContext; schema: GraphQLSchema } => {
    const schema = makeExecutableSchema({ typeDefs, resolvers: {}, allowUndefinedInResolve: true });

    return {
      schema,
      context: schemaToTemplateContext(schema)
    };
  };

  it('should output a JSON file', async () => {
    const { context, schema } = compileAndBuildContext(`
      type Query {
        fieldTest: String
      }
      
      schema {
        query: Query
      }
    `);

    const compiled = await compileTemplate(
      {
        ...config,
        config
      } as GeneratorConfig,
      context
    );

    const introspection = JSON.stringify(introspectionFromSchema(schema, { descriptions: true }));

    expect({ data: introspection }).toEqual(compiled[0].content);
  });
});
