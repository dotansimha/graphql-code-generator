import * as fs from 'fs';
import gql from 'graphql-tag';
import { introspectionToGraphQLSchema } from '../src/utils/introspection-to-schema';
import { GraphQLSchema } from 'graphql';
import { transformDocument } from '../src/operations/transform-document';

describe('transformDocument', () => {
  let schema: GraphQLSchema;

  beforeAll(() => {
    schema = introspectionToGraphQLSchema(JSON.parse(fs.readFileSync('../graphql-codegen-generators/dev-test/githunt/schema.json').toString()));
  });

  it('should return correct result when using simple fragment', () => {
    const query = gql`
      fragment MyFragment on User {
        login
        avatar_url
      }`;

    const document = transformDocument(schema, query);

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
});
