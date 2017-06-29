import * as fs from 'fs';
import gql from 'graphql-tag';
import { introspectionToGraphQLSchema } from '../src/utils/introspection-to-schema';
import { GraphQLSchema } from 'graphql';
import { transformDocument } from '../src/operations/transform-document'; import { SelectionSetInlineFragment } from '../src/types';

describe('transformDocument', () => {
  let schema: GraphQLSchema;

  beforeAll(() => {
    schema = introspectionToGraphQLSchema(JSON.parse(fs.readFileSync('../graphql-codegen-generators/dev-test/githunt/schema.json').toString()));
  });

  it('should return correct result when using simple fragment', () => {
    const fragment = gql`
      fragment MyFragment on User {
        login
        avatar_url
      }`;

    const document = transformDocument(schema, fragment);

    expect(document.operations.length).toBe(0);
    expect(document.fragments.length).toBe(1);
    expect(document.fragments[0].name).toBe('MyFragment');
    expect(document.fragments[0].onType).toBe('User');
    expect(document.fragments[0].selectionSet.length).toBe(2);
    expect(document.fragments[0].selectionSet[0].name).toBe('login');
    expect(document.fragments[0].selectionSet[1].name).toBe('avatar_url');
    expect(document.fragments[0].selectionSet[0].type).toBe('String');
    expect(document.fragments[0].selectionSet[1].type).toBe('String');
    expect(document.fragments[0].selectionSet[0].isRequired).toBeTruthy();
    expect(document.fragments[0].selectionSet[1].isRequired).toBeTruthy();
    expect(document.fragments[0].selectionSet[0].isArray).toBeFalsy();
    expect(document.fragments[0].selectionSet[1].isArray).toBeFalsy();
    expect(document.fragments[0].selectionSet[0].selectionSet.length).toBe(0);
    expect(document.fragments[0].selectionSet[1].selectionSet.length).toBe(0);
    expect(document.fragments[0].selectionSet[0].arguments.length).toBe(0);
    expect(document.fragments[0].selectionSet[1].arguments.length).toBe(0);
  });

  it('should return correct result when using 2 levels fragment', () => {
    const fragment = gql`
      fragment RepoInfo on Entry {
        createdAt
        repository {
          description
          stargazers_count
          open_issues_count
        }
        postedBy {
          html_url
          login
        }
      }
    `;

    const document = transformDocument(schema, fragment);

    expect(document.operations.length).toBe(0);
    expect(document.fragments.length).toBe(1);
    expect(document.fragments[0].name).toBe('RepoInfo');
    expect(document.fragments[0].onType).toBe('Entry');
    expect(document.fragments[0].selectionSet.length).toBe(3);
    expect(document.fragments[0].selectionSet[0].selectionSet.length).toBe(0);
    expect(document.fragments[0].selectionSet[1].selectionSet.length).toBe(3);
    expect(document.fragments[0].selectionSet[2].selectionSet.length).toBe(2);
  });

  it('should return correct result when using fragment with inline fragment', () => {
    const fragment = gql`
      fragment MyFragment on Entry {
        createdAt
        repository {
          ... on Repository {
            description
            stargazers_count
            open_issues_count
          }
        }
      }
    `;

    const document = transformDocument(schema, fragment);

    expect(document.operations.length).toBe(0);
    expect(document.fragments.length).toBe(1);
    expect(document.fragments[0].name).toBe('MyFragment');
    expect(document.fragments[0].onType).toBe('Entry');
    expect(document.fragments[0].selectionSet.length).toBe(2);
    expect(document.fragments[0].selectionSet[1].selectionSet.length).toBe(1);
    expect(document.fragments[0].selectionSet[1].selectionSet[0].selectionSet.length).toBe(3);
    expect((document.fragments[0].selectionSet[1].selectionSet[0] as SelectionSetInlineFragment).onType).toBe('Repository');
  });
});
