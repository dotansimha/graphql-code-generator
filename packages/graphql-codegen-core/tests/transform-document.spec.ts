import * as fs from 'fs';
import gql from 'graphql-tag';
import { GraphQLSchema, buildClientSchema } from 'graphql';
import { transformDocument, transformDocumentsFiles } from '../src/operations/transform-document';
import { SelectionSetFieldNode, SelectionSetFragmentSpread, SelectionSetInlineFragment } from '../src/types';

describe('transformDocument', () => {
  let schema: GraphQLSchema;

  beforeAll(() => {
    schema = buildClientSchema(JSON.parse(fs.readFileSync('../../dev-test/githunt/schema.json').toString()));
  });

  it('should handle multiple files correctly', () => {
    const fragment = {
      filePath: './a.fragment.graphql',
      content: gql`
        fragment MyFragment on User {
          login
          avatar_url
        }
      `
    };
    const document = {
      filePath: './my.query.graphql',
      content: gql`
        query MyQuery {
          currentUser {
            login
            avatar_url
          }
        }
      `
    };

    const result = transformDocumentsFiles(schema, [fragment, document]);
    expect(result.operations[0].originalFile).toBe(document.filePath);
    expect(result.fragments[0].originalFile).toBe(fragment.filePath);
  });

  it('should add the correct file path', () => {
    const fakePath = './a.graphql';
    const doc = gql`
      fragment MyFragment on User {
        login
        avatar_url
      }

      query MyQuery {
        currentUser {
          login
          avatar_url
        }
      }
    `;

    const document = transformDocument(schema, doc, fakePath);
    expect(document.operations[0].originalFile).toBe(fakePath);
    expect(document.fragments[0].originalFile).toBe(fakePath);
  });

  it('should return correct result when using simple fragment', () => {
    const fragment = gql`
      fragment MyFragment on User {
        login
        avatar_url
      }
    `;

    const document = transformDocument(schema, fragment);

    expect(document.operations.length).toBe(0);
    expect(document.fragments.length).toBe(1);
    expect(document.fragments[0].name).toBe('MyFragment');
    expect(document.fragments[0].onType).toBe('User');
    expect(document.fragments[0].selectionSet.length).toBe(2);
    const first = document.fragments[0].selectionSet[0] as SelectionSetFieldNode;
    const second = document.fragments[0].selectionSet[1] as SelectionSetFieldNode;
    expect(first.name).toBe('login');
    expect(second.name).toBe('avatar_url');
    expect(first.type).toBe('String');
    expect(second.type).toBe('String');
    expect(first.isRequired).toBeTruthy();
    expect(second.isRequired).toBeTruthy();
    expect(first.isArray).toBeFalsy();
    expect(second.isArray).toBeFalsy();
    expect(first.selectionSet.length).toBe(0);
    expect(second.selectionSet.length).toBe(0);
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
    expect((document.fragments[0].selectionSet[0] as SelectionSetFieldNode).selectionSet.length).toBe(0);
    expect((document.fragments[0].selectionSet[1] as SelectionSetFieldNode).selectionSet.length).toBe(3);
    expect((document.fragments[0].selectionSet[2] as SelectionSetFieldNode).selectionSet.length).toBe(2);
  });

  it('should return correct result when using __typename in selectionSet', () => {
    const fragment = gql`
      fragment RepoInfo on Entry {
        createdAt
        __typename
      }
    `;

    const document = transformDocument(schema, fragment);

    expect(document.operations.length).toBe(0);
    expect(document.fragments.length).toBe(1);
    expect(document.fragments[0].name).toBe('RepoInfo');
    expect(document.fragments[0].onType).toBe('Entry');
    expect(document.fragments[0].selectionSet.length).toBe(1);
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
    expect((document.fragments[0].selectionSet[1] as SelectionSetFieldNode).selectionSet.length).toBe(1);
    expect(
      ((document.fragments[0].selectionSet[1] as SelectionSetFieldNode).selectionSet[0] as SelectionSetInlineFragment)
        .selectionSet.length
    ).toBe(3);
    expect(
      ((document.fragments[0].selectionSet[1] as SelectionSetFieldNode).selectionSet[0] as SelectionSetInlineFragment)
        .onType
    ).toBe('Repository');
  });

  it('should return correct result when using 2 fragments with fragment spread', () => {
    const fragment = gql`
      fragment MyFragment on Entry {
        createdAt
        repository {
          ...RepoFragment
        }
      }

      fragment RepoFragment on Repository {
        description
        stargazers_count
        open_issues_count
      }
    `;

    const document = transformDocument(schema, fragment);

    expect(document.operations.length).toBe(0);
    expect(document.fragments.length).toBe(2);
    expect(document.fragments[0].name).toBe('MyFragment');
    expect(document.fragments[0].onType).toBe('Entry');
    expect(document.fragments[1].name).toBe('RepoFragment');
    expect(document.fragments[1].onType).toBe('Repository');
    expect(document.fragments[0].selectionSet.length).toBe(2);
    expect((document.fragments[0].selectionSet[1] as SelectionSetFieldNode).selectionSet.length).toBe(1);
    expect(
      ((document.fragments[0].selectionSet[1] as SelectionSetFieldNode).selectionSet[0] as SelectionSetFragmentSpread)
        .fragmentName
    ).toBe('RepoFragment');
  });

  it('should return correct result when using simple query', () => {
    const query = gql`
      query MyQuery {
        currentUser {
          login
          avatar_url
        }
      }
    `;

    const document = transformDocument(schema, query);

    expect(document.operations.length).toBe(1);
    expect(document.fragments.length).toBe(0);
    expect(document.operations[0].hasVariables).toBeFalsy();
    expect(document.operations[0].name).toBe('MyQuery');
    expect(document.operations[0].variables.length).toBe(0);
    expect(document.operations[0].operationType).toBe('query');
    expect(document.operations[0].selectionSet.length).toBe(1);
  });

  it('should return correct result when using anonymous query', () => {
    const query = gql`
      query {
        currentUser {
          login
          avatar_url
        }
      }
    `;

    const document = transformDocument(schema, query);

    expect(document.operations.length).toBe(1);
    expect(document.fragments.length).toBe(0);
    expect(document.operations[0].hasVariables).toBeFalsy();
    expect(document.operations[0].name).toBe('Anonymous_query_1');
    expect(document.operations[0].variables.length).toBe(0);
    expect(document.operations[0].operationType).toBe('query');
    expect(document.operations[0].selectionSet.length).toBe(1);
  });

  it('should return correct result when using simple query with 2 levels', () => {
    const query = gql`
      query MyQuery {
        entry {
          id
          postedBy {
            login
            html_url
          }
          createdAt
        }
      }
    `;

    const document = transformDocument(schema, query);

    expect(document.operations.length).toBe(1);
    expect(document.fragments.length).toBe(0);
    expect(document.operations[0].hasVariables).toBeFalsy();
    expect(document.operations[0].name).toBe('MyQuery');
    expect(document.operations[0].variables.length).toBe(0);
    expect(document.operations[0].operationType).toBe('query');
    expect(document.operations[0].selectionSet.length).toBe(1);

    const operation = document.operations[0].selectionSet[0] as SelectionSetFieldNode;
    expect(operation.selectionSet.length).toBe(3);
    const innerField0 = operation.selectionSet[0] as SelectionSetFieldNode;
    const innerField1 = operation.selectionSet[1] as SelectionSetFieldNode;
    const innerField2 = operation.selectionSet[2] as SelectionSetFieldNode;
    expect(innerField0.name).toBe('id');
    expect(innerField1.name).toBe('postedBy');
    expect(innerField2.name).toBe('createdAt');
  });

  it('should handle anonymous document correctly', () => {
    const query = gql`
      query {
        entry {
          id
          postedBy {
            login
            html_url
          }
          createdAt
        }
      }
    `;

    const document = transformDocument(schema, query);

    expect(document.operations[0].name).toBe('Anonymous_query_2');
  });

  it('should handle anonymous document correctly when already used', () => {
    const query = gql`
      query {
        entry {
          id
          postedBy {
            login
            html_url
          }
          createdAt
        }
      }
    `;

    const query2 = gql`
      query {
        entry {
          id
        }
      }
    `;

    const document = transformDocument(schema, query);
    const document2 = transformDocument(schema, query2);

    expect(document.operations[0].name).toBe('Anonymous_query_3');
    expect(document2.operations[0].name).toBe('Anonymous_query_4');
  });
});
