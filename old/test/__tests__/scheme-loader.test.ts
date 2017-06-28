import {validateSchema, loadSchema} from "../../src/loaders/scheme-loader";
import {IntrospectionQuery} from "graphql/utilities/introspectionQuery";
import {GraphQLSchema} from "graphql/type/schema";

describe('scheme-loader', () => {
  let schema;

  beforeAll(() => {
    schema = require('../../dev-test/githunt/schema.json');
  });

  describe('loadSchema', () => {
    test('should return GraphQLSchema object', () => {
      const value = loadSchema(schema);

      expect(value instanceof GraphQLSchema).toBeTruthy();
    });

    test('should return valid GraphQLSchema object', () => {
      const value = loadSchema(schema);

      expect(value.getQueryType()).toBeDefined();
      expect(value.getMutationType()).toBeDefined();
      expect(value.getSubscriptionType()).toBeDefined();
    });
  });

  describe('validateSchema', () => {
    test('should not throw an exception when using a valid schema', () => {
      expect(() => {
        validateSchema(schema);
      }).not.toThrow();
    });

    test('should throw an exception when using an invalid schema', () => {
      expect(() => {
        validateSchema(<IntrospectionQuery>{});
      }).toThrow();
    });
  });
});
