import { buildSchema, parse } from 'graphql';
import { beforeEach, vi } from 'vitest';

const { visitorSpy } = vi.hoisted(() => ({
  visitorSpy: [] as unknown[][],
}));

vi.mock('../src/visitor.js', () => ({
  TypeScriptDocumentsVisitor: class MockTypeScriptDocumentsVisitor {
    config = { noExport: false };

    constructor(...args: unknown[]) {
      visitorSpy.push(args);
    }

    getImports() {
      return [];
    }

    getGlobalDeclarations() {
      return [];
    }
  },
}));

describe('TypeScript Operations Plugin - externalFragments', () => {
  beforeEach(() => {
    visitorSpy.length = 0;
  });

  it('dedupes repeated external fragments before visiting documents', async () => {
    const { plugin } = await import('../src/index.js');

    const schema = buildSchema(/* GraphQL */ `
      type Query {
        user: User
      }

      type User {
        id: ID!
        name: String!
      }
    `);

    const query = parse(/* GraphQL */ `
      query User {
        user {
          ...UserFragment
        }
      }
    `);

    const externalFragment = {
      node: parse(/* GraphQL */ `
        fragment UserFragment on User {
          id
          name
        }
      `).definitions[0],
      name: 'UserFragment',
      onType: 'User',
      isExternal: true,
    };

    await plugin(
      schema,
      [{ location: '', document: query }],
      {
        externalFragments: [externalFragment, externalFragment],
      },
      { outputFile: '' },
    );

    const fragments = visitorSpy[0][2];

    expect(fragments).toHaveLength(1);
    expect(fragments[0].name).toBe('UserFragment');
  });
});
