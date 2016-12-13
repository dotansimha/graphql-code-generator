jest.mock('fs');
import * as fs from 'fs';

import {
  isRequired, isArray, shouldSkip, getTypeName, getFieldDef, isPrimitive,
  handleNameDuplications, getRoot
} from "../../src/utils";
import {GraphQLInputObjectType} from "graphql/type/definition";
import {GraphQLNonNull} from "graphql/type/definition";
import {GraphQLFloat} from "graphql/type/scalars";
import {GraphQLList} from "graphql/type/definition";
import {GraphQLString} from "graphql/type/scalars";
import {GraphQLType} from "graphql/type/definition";
import {loadSchema} from "../../src/scheme-loader";
import {GraphQLSchema} from "graphql/type/schema";
import {loadDocumentsSources} from "../../src/document-loader";
import {OperationDefinitionNode} from "graphql/language/ast";
import {FIELD} from "graphql/language/kinds";

const getSomeField = (document) => {
  let nodeField: any = null;

  document.selectionSet.selections.forEach((oper) => {
    if (oper.kind === FIELD && !nodeField) {
      nodeField = oper;
    }
  });

  return nodeField;
};

describe('model-handler', () => {
  let testSchema: GraphQLSchema;
  let rootType: GraphQLType;
  let inputTypeObject: GraphQLInputObjectType;
  let typeObject: GraphQLType;
  let document: OperationDefinitionNode;

  beforeAll(() => {
    fs['__setMockFiles']({
      'feed.query.graphql': `
        query Feed($type: FeedType!, $offset: Int, $limit: Int) {
          currentUser {
            login
          }
          feed(type: $type, offset: $offset, limit: $limit) {
            ...FeedEntry
          }
        }`
    });

    document = <OperationDefinitionNode>(loadDocumentsSources([
      'feed.query.graphql'
    ]).definitions[0]);

    testSchema = loadSchema(require('../../dev-test/githunt/schema.json'));
    rootType = getRoot(testSchema, document);

    typeObject = new GraphQLInputObjectType({
      name: 'MyCustomType',
      fields: {
        lat: {type: new GraphQLNonNull(GraphQLFloat)},
        alt: {type: GraphQLFloat, defaultValue: 0},
        arrTest: {type: new GraphQLList(GraphQLString)}
      }
    });

    inputTypeObject = new GraphQLInputObjectType({
      name: 'MyType',
      fields: {
        lat: {type: new GraphQLNonNull(GraphQLFloat)},
        alt: {type: GraphQLFloat, defaultValue: 0},
        arrTest: {type: new GraphQLList(GraphQLString)},
        requiredObject: {type: new GraphQLNonNull(typeObject)},
        objectsArr: {type: new GraphQLList(typeObject)}
      }
    });
  });

  describe('getFieldDef', () => {
    test('should return a field definition for root items', () => {
      let nodeField = getSomeField(document);

      expect(String(getFieldDef(rootType, nodeField).type)).toBe('User');
    });
  });

  describe('isPrimitive', () => {
    test('should return true when type defined in the primitives map', () => {
      expect(isPrimitive({Float: 'number'}, 'number')).toBeTruthy();
    });

    test('should return false when type not defined in the primitives map', () => {
      expect(isPrimitive({Float: 'number'}, 'string')).toBeFalsy();
    });
  });

  describe('getTypeName', () => {
    test('should return a clean type name when type is an object', () => {
      expect(getTypeName({}, inputTypeObject)).toBe('MyType');
    });

    test('should return a clean type name when type is a required object', () => {
      expect(getTypeName({}, inputTypeObject.getFields()['requiredObject'].type)).toBe('MyCustomType');
    });

    test('should return a clean type name when type is an array', () => {
      expect(getTypeName({}, inputTypeObject.getFields()['objectsArr'].type)).toBe('MyCustomType');
    });

    test('should return a clean type name when type is a primitive', () => {
      expect(getTypeName({Float: 'number'}, inputTypeObject.getFields()['alt'].type)).toBe('number');
    });

    test('should return a clean type name when type is a primitive and not defined in schema', () => {
      expect(getTypeName({Other: 'other'}, inputTypeObject.getFields()['alt'].type)).toBe('Float');
    });

    test('should return a clean type name when type is a required primitive', () => {
      expect(getTypeName({Float: 'number'}, inputTypeObject.getFields()['lat'].type)).toBe('number');
    });

    test('should return a clean type name when type is an array of primitives', () => {
      expect(getTypeName({String: 'string'}, inputTypeObject.getFields()['arrTest'].type)).toBe('string');
    });
  });

  describe('shouldSkip', () => {
    test('should return true when type name is not set', () => {
      expect(shouldSkip(undefined)).toBeTruthy();
    });

    test('should return true when type name contains __', () => {
      expect(shouldSkip('__MyType')).toBeTruthy();
    });

    test('should return true when type is root (Query)', () => {
      expect(shouldSkip('Query')).toBeTruthy();
    });

    test('should return true when type is root (Mutation)', () => {
      expect(shouldSkip('Mutation')).toBeTruthy();
    });

    test('should return true when type is root (Subscription)', () => {
      expect(shouldSkip('Subscription')).toBeTruthy();
    });

    test('should return false when type is a regular type (not root or __)', () => {
      expect(shouldSkip('MyType')).toBeFalsy();
    });

    test('should return false when type is a required type', () => {
      expect(shouldSkip('MyType!')).toBeFalsy();
    });

    test('should return false when type is a list type', () => {
      expect(shouldSkip('[MyType]')).toBeFalsy();
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

  describe('handleNameDuplications', () => {
    test('should return the same name when there are no dupes', () => {
      expect(handleNameDuplications('Name', [])).toBe('Name');
    });

    test('should return the correct name when name exists', () => {
      expect(handleNameDuplications('Name', [{name: 'Name'}])).toBe('_Name');
    });

    test('should return the correct name when name exists multiple times', () => {
      expect(handleNameDuplications('Name', [{name: '_Name'}, {name: 'Name'}])).toBe('__Name');
    });
  })
});