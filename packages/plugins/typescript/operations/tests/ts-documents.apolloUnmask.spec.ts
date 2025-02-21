import { parse } from 'graphql';
import { schema } from './shared/schema.js';
import { plugin } from '../src/index.js';

describe('TypeScript Operations Plugin - apolloUnmask', () => {
  it("'mask' with @unmask configured with apolloUnmask yields correct types", async () => {
    const ast = parse(/* GraphQL */ `
      query {
        me {
          ...UserFragment @unmask
        }
      }
      fragment UserFragment on User {
        id
      }
    `);
    const result = await plugin(
      schema,
      [{ location: 'test-file.ts', document: ast }],
      { inlineFragmentTypes: 'mask', customDirectives: { apolloUnmask: true } },
      { outputFile: '' }
    );

    expect(result.content).toMatchInlineSnapshot(`
      "export type Unnamed_1_QueryVariables = Exact<{ [key: string]: never; }>;


      export type Unnamed_1_Query = { __typename?: 'Query', me?: { __typename?: 'User', id: string } | null };

      export type UserFragmentFragment = { __typename?: 'User', id: string } & { ' $fragmentName'?: 'UserFragmentFragment' };
      "
    `);
  });

  it("'mask' with @unmask without apolloUnmask yields correct types", async () => {
    const ast = parse(/* GraphQL */ `
      query {
        me {
          ...UserFragment @unmask
        }
      }
      fragment UserFragment on User {
        id
      }
    `);
    const result = await plugin(
      schema,
      [{ location: 'test-file.ts', document: ast }],
      { inlineFragmentTypes: 'mask' },
      { outputFile: '' }
    );
    expect(result.content).toMatchInlineSnapshot(`
      "export type Unnamed_1_QueryVariables = Exact<{ [key: string]: never; }>;


      export type Unnamed_1_Query = { __typename?: 'Query', me?: (
          { __typename?: 'User' }
          & { ' $fragmentRefs'?: { 'UserFragmentFragment': UserFragmentFragment } }
        ) | null };

      export type UserFragmentFragment = { __typename?: 'User', id: string } & { ' $fragmentName'?: 'UserFragmentFragment' };
      "
    `);
  });

  it("'mask' with @unmask with apolloUnmask explicitly disabled yields correct types", async () => {
    const ast = parse(/* GraphQL */ `
      query {
        me {
          ...UserFragment @unmask
        }
      }
      fragment UserFragment on User {
        id
      }
    `);
    const result = await plugin(
      schema,
      [{ location: 'test-file.ts', document: ast }],
      { inlineFragmentTypes: 'mask', customDirectives: { apolloUnmask: false } },
      { outputFile: '' }
    );
    expect(result.content).toMatchInlineSnapshot(`
      "export type Unnamed_1_QueryVariables = Exact<{ [key: string]: never; }>;


      export type Unnamed_1_Query = { __typename?: 'Query', me?: (
          { __typename?: 'User' }
          & { ' $fragmentRefs'?: { 'UserFragmentFragment': UserFragmentFragment } }
        ) | null };

      export type UserFragmentFragment = { __typename?: 'User', id: string } & { ' $fragmentName'?: 'UserFragmentFragment' };
      "
    `);
  });

  it("'mask' with @unmask and masked fragments yields correct types", async () => {
    const ast = parse(/* GraphQL */ `
      query {
        me {
          ...UserFragment @unmask
          ...UserFragment2
        }
      }
      fragment UserFragment on User {
        id
      }

      fragment UserFragment2 on User {
        email
      }
    `);
    const result = await plugin(
      schema,
      [{ location: 'test-file.ts', document: ast }],
      { inlineFragmentTypes: 'mask', customDirectives: { apolloUnmask: true } },
      { outputFile: '' }
    );
    expect(result.content).toMatchInlineSnapshot(`
      "export type Unnamed_1_QueryVariables = Exact<{ [key: string]: never; }>;


      export type Unnamed_1_Query = { __typename?: 'Query', me?: (
          { __typename?: 'User', id: string }
          & { ' $fragmentRefs'?: { 'UserFragment2Fragment': UserFragment2Fragment } }
        ) | null };

      export type UserFragmentFragment = { __typename?: 'User', id: string } & { ' $fragmentName'?: 'UserFragmentFragment' };

      export type UserFragment2Fragment = { __typename?: 'User', email: string } & { ' $fragmentName'?: 'UserFragment2Fragment' };
      "
    `);
  });

  it("'mask' with @unmask and masked fragments on overlapping fields yields correct types", async () => {
    const ast = parse(/* GraphQL */ `
      query {
        me {
          ...UserFragment @unmask
          ...UserFragment2
        }
      }
      fragment UserFragment on User {
        id
        email
      }

      fragment UserFragment2 on User {
        email
      }
    `);
    const result = await plugin(
      schema,
      [{ location: 'test-file.ts', document: ast }],
      { inlineFragmentTypes: 'mask', customDirectives: { apolloUnmask: true } },
      { outputFile: '' }
    );
    expect(result.content).toMatchInlineSnapshot(`
      "export type Unnamed_1_QueryVariables = Exact<{ [key: string]: never; }>;


      export type Unnamed_1_Query = { __typename?: 'Query', me?: (
          { __typename?: 'User', id: string, email: string }
          & { ' $fragmentRefs'?: { 'UserFragment2Fragment': UserFragment2Fragment } }
        ) | null };

      export type UserFragmentFragment = { __typename?: 'User', id: string, email: string } & { ' $fragmentName'?: 'UserFragmentFragment' };

      export type UserFragment2Fragment = { __typename?: 'User', email: string } & { ' $fragmentName'?: 'UserFragment2Fragment' };
      "
    `);
  });
});
