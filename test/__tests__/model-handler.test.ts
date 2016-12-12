import {isRequired, isArray} from "../../src/model-handler";
import {GraphQLObjectType} from "graphql/type/definition";
import {GraphQLType} from "graphql/type/definition";
import {GraphQLInputObjectType} from "graphql/type/definition";
import {GraphQLNonNull} from "graphql/type/definition";
import {GraphQLFloat} from "graphql/type/scalars";
import {GraphQLList} from "graphql/type/definition";
import {GraphQLString} from "graphql/type/scalars";

describe('model-handler', () => {
  let inputTypeObject: GraphQLInputObjectType;

  beforeAll(() => {
    inputTypeObject = new GraphQLInputObjectType({
      name: 'MyType',
      fields: {
        lat: {type: new GraphQLNonNull(GraphQLFloat)},
        alt: {type: GraphQLFloat, defaultValue: 0},
        arrTest: {type: new GraphQLList(GraphQLString)}
      }
    });
  });

  describe('isRequired', () => {
    test('should return true when using GraphQLNonNull type', () => {
      const field = inputTypeObject.getFields()['lat'];

      expect(isRequired(field.type)).toBeTruthy();
    });

    test('should return false when using regular GraphQL type (not GraphQLNonNull)', () => {
      const field = inputTypeObject.getFields()['alt'];

      expect(isRequired(field.type)).toBeFalsy();
    });
  });

  describe('isArray', () => {
    test('should return true when using GraphQLList type', () => {
      const field = inputTypeObject.getFields()['arrTest'];

      expect(isArray(field.type)).toBeTruthy();
    });

    test('should return false when using regular GraphQL type (not GraphQLList)', () => {
      const field = inputTypeObject.getFields()['alt'];

      expect(isArray(field.type)).toBeFalsy();
    });
  });
});