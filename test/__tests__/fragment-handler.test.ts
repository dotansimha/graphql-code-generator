jest.mock('fs');
import * as fs from 'fs';

import {handleFragment} from "../../src/fragment-handler";
import {GraphQLSchema} from "graphql/type/schema";
import {loadSchema} from "../../src/scheme-loader";
import {loadDocumentsSources} from "../../src/document-loader";
import {FragmentDefinitionNode} from "graphql/language/ast";
import { stripIndent } from 'common-tags';

describe('handleFragment', () => {
  let testSchema: GraphQLSchema;
  let document: FragmentDefinitionNode;
  let primitivesMap = {
    "String": "string",
    "Int": "number",
    "Float": "number",
    "Boolean": "boolean",
    "ID": "string"
  };
  const fragmentString = stripIndent`
        fragment feedEntry on Entry {
          id
          commentCount
          repository {
            full_name
            html_url
            owner {
              avatar_url
            }
          }
        }`;

  beforeAll(() => {
    fs['__setMockFiles']({
      'feed-entry.fragment.graphql': fragmentString
    });

    testSchema = loadSchema(require('../../dev-test/githunt/schema.json'));

    document = <FragmentDefinitionNode>(loadDocumentsSources([
      'feed-entry.fragment.graphql'
    ]).definitions[0]);
  });

  test('should create a valid CodegenDocument object from the fragment definition', () => {
    expect(handleFragment(testSchema, document, primitivesMap, true)).toBeDefined();
  });

  test('should return the correct amount of inner models', () => {
    const codegen = handleFragment(testSchema, document, primitivesMap, true);

    expect(codegen.hasInnerTypes).toBeTruthy();
    expect(codegen.innerTypes.length).toBe(3);
  });

  test('should detect the correct inner models for the fragment', () => {
    const codegen = handleFragment(testSchema, document, primitivesMap, true);

    expect(codegen.innerTypes.map(type => type.name)).toEqual(['Fragment', 'Repository', 'Owner']);
  });

  test('should return the correct name with the correct case', () => {
    const codegen = handleFragment(testSchema, document, primitivesMap, true);

    expect(codegen.name).toBe('FeedEntry');
  });

  test('should return the correct raw name', () => {
    const codegen = handleFragment(testSchema, document, primitivesMap, true);

    expect(codegen.rawName).toBe('feedEntry');
  });

  test('should return the correct value for isQuery', () => {
    const codegen = handleFragment(testSchema, document, primitivesMap, true);

    expect(codegen.isQuery).toBeFalsy();
  });

  test('should return the correct value for isSubscription', () => {
    const codegen = handleFragment(testSchema, document, primitivesMap, true);

    expect(codegen.isSubscription).toBeFalsy();
  });

  test('should return the correct value for isMutation', () => {
    const codegen = handleFragment(testSchema, document, primitivesMap, true);

    expect(codegen.isMutation).toBeFalsy();
  });

  test('should return the correct value for isFragment', () => {
    const codegen = handleFragment(testSchema, document, primitivesMap, true);

    expect(codegen.isFragment).toBeTruthy();
  });

  test('should return the correct document string', () => {
    const codegen = handleFragment(testSchema, document, primitivesMap, true);

    expect(stripIndent`${codegen.document}`).toBe(fragmentString);
  });

  test('should contain the correct inner type with name Fragment', () => {
    const codegen = handleFragment(testSchema, document, primitivesMap, true);
    const fragmentModel = codegen.innerTypes.find(item => item.name === 'Fragment');

    expect(fragmentModel.name).toBe('Fragment');
    expect(fragmentModel.isObject).toBeTruthy();
    expect(fragmentModel.isFragment).toBeTruthy();
    expect(fragmentModel.fragmentsUsed).toEqual([]);
  });

  test('should detect the correct inner fragments that in use', () => {
    const fragmentString = stripIndent`
        fragment feedEntry on Entry {
          id
          commentCount
          repository {
            full_name
            html_url
            owner {
              avatar_url
            }
          }
          ...VoteButtons
          ...RepoInfo
        }`;

    fs['__setMockFiles']({
      'multiple-fragments.graphql': fragmentString
    });

    document = <FragmentDefinitionNode>(loadDocumentsSources([
      'multiple-fragments.graphql'
    ]).definitions[0]);

    const codegen = handleFragment(testSchema, document, primitivesMap, true);
    const fragmentModel = codegen.innerTypes.find(item => item.name === 'Fragment');

    expect(fragmentModel.fragmentsUsed).toEqual(['VoteButtons', 'RepoInfo']);
  });
});
