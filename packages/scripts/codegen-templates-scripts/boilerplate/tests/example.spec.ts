import {
  GeneratorConfig,
  gql,
  GraphQLSchema,
  introspectionToGraphQLSchema,
  makeExecutableSchema,
  SchemaTemplateContext,
  schemaToTemplateContext,
  transformDocument
} from 'graphql-codegen-core';
import { compileTemplate } from 'graphql-codegen-compiler';
import config from '../dist';

describe('Tests Example', () => {
  const compileAndBuildContext = (typeDefs: string): { context: SchemaTemplateContext; schema: GraphQLSchema } => {
    const schema = makeExecutableSchema({ typeDefs, resolvers: {}, allowUndefinedInResolve: true }) as GraphQLSchema;

    return {
      schema,
      context: schemaToTemplateContext(schema)
    };
  };

  const testSchema = `
    type Query {
      fieldTest: String
    }
    
    schema {
      query: Query
    }
  `;

  describe('Schema Only', () => {
    it('Should execute and return the correct result', async () => {
      const { context } = compileAndBuildContext(testSchema);
      const compiled = await compileTemplate(config, context);

      expect(compiled[0].content).toBeDefined();
    });
  });

  describe('Schema and Documents', () => {
    it('Should execute and return the correct results', async () => {
      const { context, schema } = compileAndBuildContext(testSchema);
      const documents = gql`
        query myQuery {
          fieldTest
        }
      `;

      const transformedDocument = transformDocument(schema, documents);
      const compiled = await compileTemplate(config, context, [transformedDocument], { generateSchema: false });
      const content = compiled[0].content;

      expect(content).toBeDefined();
    });
  });
});
