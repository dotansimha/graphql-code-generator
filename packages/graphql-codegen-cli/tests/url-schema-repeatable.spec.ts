import { buildSchema, graphql } from 'graphql';
import { executeCodegen } from '../src/index.js';

describe('URL schema with repeatable directives (#10414)', () => {
  const serverSchema = buildSchema(/* GraphQL */ `
    directive @key(fields: String!) repeatable on OBJECT | INTERFACE

    type Query @key(fields: "id") {
      id: ID
    }
  `);

  // Answers requests by executing the received introspection query against the real schema
  const schemaServerFetch = async (_url: string, options?: RequestInit): Promise<Response> => {
    const { query } = JSON.parse(String(options?.body));
    const result = await graphql({ schema: serverSchema, source: query });
    return new Response(JSON.stringify(result), {
      headers: { 'content-type': 'application/json' },
    });
  };

  const generateSchemaAst = async ({
    pointerOptions,
  }: {
    pointerOptions: Record<string, unknown>;
  }): Promise<string> => {
    const { result } = await executeCodegen({
      schema: [{ 'http://www.dummyschema.com/graphql': pointerOptions }],
      customFetch: schemaServerFetch,
      generates: {
        'out1.graphql': {
          plugins: ['schema-ast'],
          config: { includeDirectives: true },
        },
      },
    });
    return result[0].content;
  };

  it('keeps `repeatable` when the directiveIsRepeatable pointer option is true', async () => {
    const content = await generateSchemaAst({ pointerOptions: { directiveIsRepeatable: true } });

    expect(content).toContain('repeatable');
  });

  it('drops `repeatable` by default when the option is unset', async () => {
    const content = await generateSchemaAst({ pointerOptions: {} });

    expect(content).toContain('directive @key');
    expect(content).not.toContain('repeatable');
  });
});
