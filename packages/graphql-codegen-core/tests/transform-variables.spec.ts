import gql from 'graphql-tag';
import { GraphQLSchema } from 'graphql';
import * as fs from 'fs';
import { introspectionToGraphQLSchema } from '../src/utils/introspection-to-schema';
import { transformVariables } from '../src/operations/transform-variables';

describe('transformVariables', () => {
  let schema: GraphQLSchema;

  beforeAll(() => {
    schema = introspectionToGraphQLSchema(JSON.parse(fs.readFileSync('../../dev-test/githunt/schema.json').toString()));
  });

  it('should return empty array when where are no variables', () => {
    const query = gql`
      query MyQuery {
        currentUser {
          login
          avatar_url
        }
      }
    `;

    const variables = transformVariables(schema, query.definitions[0]);
    expect(variables.length).toBe(0);
  });

  it('should return correct results when using query with one simple variable', () => {
    const query = gql`
      query MyQuery($test: String) {
        currentUser {
          login
          avatar_url
        }
      }
    `;

    const variables = transformVariables(schema, query.definitions[0]);
    expect(variables.length).toBe(1);
    expect(variables[0].name).toBe('test');
    expect(variables[0].type).toBe('String');
    expect(variables[0].isRequired).toBeFalsy();
    expect(variables[0].isArray).toBeFalsy();
  });

  it('should return correct results when using query with more than one simple variable', () => {
    const query = gql`
      query MyQuery($test: String, $t2: Int!, $t3: [String]!) {
        currentUser {
          login
          avatar_url
        }
      }
    `;

    const variables = transformVariables(schema, query.definitions[0]);
    expect(variables.length).toBe(3);
    expect(variables[0].name).toBe('test');
    expect(variables[0].type).toBe('String');
    expect(variables[0].isRequired).toBeFalsy();
    expect(variables[0].isArray).toBeFalsy();
    expect(variables[1].name).toBe('t2');
    expect(variables[1].type).toBe('Int');
    expect(variables[1].isRequired).toBeTruthy();
    expect(variables[1].isArray).toBeFalsy();
    expect(variables[2].name).toBe('t3');
    expect(variables[2].type).toBe('String');
    expect(variables[2].isRequired).toBeTruthy();
    expect(variables[2].isArray).toBeTruthy();
  });
});
