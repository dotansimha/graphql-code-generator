import {OperationDefinitionNode} from "graphql/language/ast";
jest.mock('fs');
import * as fs from 'fs';

import {GraphQLSchema} from "graphql/type/schema";
import {loadSchema} from "../../src/scheme-loader";
import {loadDocumentsSources} from "../../src/document-loader";
import {DocumentNode} from "graphql/language/ast";
import { stripIndent } from 'common-tags';
import {handleOperation} from "../../src/operation-handler";

describe('handleOperation', () => {
  let testSchema: GraphQLSchema;
  let documents: DocumentNode;
  let primitivesMap = {
    "String": "string",
    "Int": "number",
    "Float": "number",
    "Boolean": "boolean",
    "ID": "string"
  };

  const mutationString = stripIndent`
    mutation submitComment($repoFullName: String!, $commentContent: String!) {
      submitComment(repoFullName: $repoFullName, commentContent: $commentContent) {
        ...CommentsPageComment
      }
    }
  `;

  const subscriptionString = stripIndent`
    subscription onCommentAdded($repoFullName: String!){
      commentAdded(repoFullName: $repoFullName){
        id
        postedBy {
          login
          html_url
        }
        createdAt
        content
      }
    }`;

  const queryString = stripIndent`
    query Comment($repoFullName: String!, $limit: Int, $offset: Int) {
      # Eventually move this into a no fetch query right on the entry
      # since we literally just need this info to determine whether to
      # show upvote/downvote buttons
      currentUser {
        login
        html_url
      }
      entry(repoFullName: $repoFullName) {
        id
        postedBy {
          login
          html_url
        }
        createdAt
        comments(limit: $limit, offset: $offset) {
          ...CommentsPageComment
        }
        commentCount
        repository {
          full_name
          html_url
    
          ... on Repository {
            description
            open_issues_count
            stargazers_count
          }
        }
    
      }
    }`;

  beforeAll(() => {
    fs['__setMockFiles']({
      'comment.query.graphql': queryString,
      'submit-comment.mutation.graphql': mutationString,
      'comment-added.subscription.graphql': subscriptionString
    });

    testSchema = loadSchema(require('../../dev-test/githunt/schema.json'));

    documents = loadDocumentsSources([
      'comment.query.graphql',
      'submit-comment.mutation.graphql',
      'comment-added.subscription.graphql'
    ]);
  });

  describe('handleOperation', () => {
    describe('Imports', () => {
      test('should create the correct imports array', () => {
        const definition = <OperationDefinitionNode>documents.definitions[0];
        const codegen = handleOperation(testSchema, definition, primitivesMap);

        expect(codegen.imports).toEqual([]);
      });
    });

    describe('Query', () => {
      test('Should return the correct name for query', () => {
        const definition = <OperationDefinitionNode>documents.definitions[0];
        const codegen = handleOperation(testSchema, definition, primitivesMap);

        expect(codegen.name).toBe('CommentQuery');
      });

      test('Should return the correct booleans for query', () => {
        const definition = <OperationDefinitionNode>documents.definitions[0];
        const codegen = handleOperation(testSchema, definition, primitivesMap);

        expect(codegen.isQuery).toBeTruthy();
        expect(codegen.isSubscription).toBeFalsy();
        expect(codegen.isMutation).toBeFalsy();
        expect(codegen.isFragment).toBeFalsy();
      });
    });

    describe('Mutation', () => {
      test('Should return the correct name for mutation', () => {
        const definition = <OperationDefinitionNode>documents.definitions[1];
        const codegen = handleOperation(testSchema, definition, primitivesMap);

        expect(codegen.name).toBe('SubmitCommentMutation');
      });

      test('Should return the correct booleans for mutation', () => {
        const definition = <OperationDefinitionNode>documents.definitions[1];
        const codegen = handleOperation(testSchema, definition, primitivesMap);

        expect(codegen.isMutation).toBeTruthy();
        expect(codegen.isSubscription).toBeFalsy();
        expect(codegen.isQuery).toBeFalsy();
        expect(codegen.isFragment).toBeFalsy();
      });
    });

    describe('Subscription', () => {
      test('Should return the correct name for subscription', () => {
        const definition = <OperationDefinitionNode>documents.definitions[2];
        const codegen = handleOperation(testSchema, definition, primitivesMap);

        expect(codegen.name).toBe('OnCommentAddedSubscription');
      });

      test('Should return the correct booleans for subscription', () => {
        const definition = <OperationDefinitionNode>documents.definitions[2];
        const codegen = handleOperation(testSchema, definition, primitivesMap);

        expect(codegen.isSubscription).toBeTruthy();
        expect(codegen.isMutation).toBeFalsy();
        expect(codegen.isQuery).toBeFalsy();
        expect(codegen.isFragment).toBeFalsy();
      });
    });
  });
});
