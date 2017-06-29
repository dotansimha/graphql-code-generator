import { DocumentNode, GraphQLEnumType, GraphQLObjectType, GraphQLString, OperationDefinitionNode } from 'graphql';
import gql from 'graphql-tag'; import { getFieldDef } from '../src/utils/get-field-def';

describe('getFieldDef', () => {
  it('should return the correct field when using GraphQLObjectType', () => {
    const type = new GraphQLObjectType({
      name: 'myType',
      fields: {
        f1: {
          type: GraphQLString,
          name: 'f1',
        },
      },
    });

    const parsedDocuments = gql`
      query {
        f1
      }
    `;

    const fieldNode = ((parsedDocuments as DocumentNode).definitions[0] as OperationDefinitionNode).selectionSet.selections[0];
    const fieldDef = getFieldDef(type, fieldNode);

    expect(fieldDef.type).toBe(GraphQLString);
    expect(fieldDef.name).toBe('f1');
  });

  it('should return null when incorrect GraphQL object type provided', () => {
    const type = new GraphQLEnumType({
      name: 'myType',
      values: {
        A: {},
        B: {},
      },
    });

    const parsedDocuments = gql`
      query {
        f1
      }
    `;

    const fieldNode = ((parsedDocuments as DocumentNode).definitions[0] as OperationDefinitionNode).selectionSet.selections[0];
    const fieldDef = getFieldDef(type, fieldNode);

    expect(fieldDef).toBe(null);
  });
});
