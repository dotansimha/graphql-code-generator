import {loadSchema} from "../../src/scheme-loader";
import {GraphQLSchema} from "graphql/type/schema";
import {handleType} from "../../src/model-handler";
import {Model} from "../../src/interfaces";

const primitivesMap = {
  "String": "string",
  "Int": "number",
  "Float": "number",
  "Boolean": "boolean",
  "ID": "string"
};

describe('model-handler', () => {
  let testSchema: GraphQLSchema;
  let typesMap;

  beforeAll(() => {
    testSchema = loadSchema(require('../../dev-test/githunt/schema.json'));
    typesMap = testSchema.getTypeMap();
  });

  describe('handleType', () => {
    test('should return valid Model', () => {
      const model = handleType(testSchema, primitivesMap, typesMap['Repository']);
      expect(model).toBeDefined();add
    });

    test('should return the correct type name', () => {
      const model = handleType(testSchema, primitivesMap, typesMap['Repository']);

      expect(model[0].name).toBe('Repository');
    });
  });
});
