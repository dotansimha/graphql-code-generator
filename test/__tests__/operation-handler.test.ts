jest.mock('fs');

import { OperationDefinitionNode } from 'graphql/language/ast';
import * as fs from 'fs';
import { GraphQLSchema } from 'graphql/type/schema';
import { loadSchema } from '../../src/loaders/scheme-loader';
import { loadDocumentsSources } from '../../src/loaders/document-loader';
import { DocumentNode } from 'graphql/language/ast';
import { stripIndent } from 'common-tags';
import { handleOperation, buildVariables } from '../../src/handlers/operation-handler';

describe('handleOperation', () => {
  let testSchema: GraphQLSchema;
  let documents: DocumentNode;
  let primitivesMap = {
    'String': 'string',
    'Int': 'number',
    'Float': 'number',
    'Boolean': 'boolean',
    'ID': 'string'
  };

  const mutationString = stripIndent`
    mutation submitComment($repoFullName: String!, $commentContent: String!) {
      submitComment(repoFullName: $repoFullName, commentContent: $commentContent) {
        ...CommentsPageComment
      }
    }
  `;

  const anonymousMutationString = stripIndent`
    mutation($repoFullName: String!, $commentContent: String!) {
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
      'comment-added.subscription.graphql': subscriptionString,
      'anonymous.mutation.graphql': anonymousMutationString,
    });

    testSchema = loadSchema(require('../../dev-test/githunt/schema.json'));

    documents = loadDocumentsSources([
      'comment.query.graphql',
      'submit-comment.mutation.graphql',
      'comment-added.subscription.graphql',
      'anonymous.mutation.graphql',
    ]);
  });

  describe('Schema', () => {
    test('should polyfill when root types are missing', () => {
      const schema = loadSchema(require('../../dev-test/githunt/schema_without_mutations.json'));

      expect(() => {
        const definition = <OperationDefinitionNode>documents.definitions[1];
        handleOperation(schema, definition, primitivesMap);
      }).not.toThrow();
    });
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
      test('should return the correct name for query', () => {
        const definition = <OperationDefinitionNode>documents.definitions[0];
        const codegen = handleOperation(testSchema, definition, primitivesMap);

        expect(codegen.name).toBe('CommentQuery');
      });

      test('should return the correct booleans for query', () => {
        const definition = <OperationDefinitionNode>documents.definitions[0];
        const codegen = handleOperation(testSchema, definition, primitivesMap);

        expect(codegen.isQuery).toBeTruthy();
        expect(codegen.isSubscription).toBeFalsy();
        expect(codegen.isMutation).toBeFalsy();
        expect(codegen.isFragment).toBeFalsy();
      });
    });

    describe('Mutation', () => {
      test('should return the correct name for mutation', () => {
        const definition = <OperationDefinitionNode>documents.definitions[1];
        const codegen = handleOperation(testSchema, definition, primitivesMap);

        expect(codegen.name).toBe('SubmitCommentMutation');
      });

      test('should return the correct name for anonymous mutation', () => {
        const definition = <OperationDefinitionNode>documents.definitions[3];
        const codegen = handleOperation(testSchema, definition, primitivesMap);

        expect(codegen.name).toBe('Anonymous_1Mutation');
      });

      test('should return the correct booleans for mutation', () => {
        const definition = <OperationDefinitionNode>documents.definitions[1];
        const codegen = handleOperation(testSchema, definition, primitivesMap);

        expect(codegen.isMutation).toBeTruthy();
        expect(codegen.isSubscription).toBeFalsy();
        expect(codegen.isQuery).toBeFalsy();
        expect(codegen.isFragment).toBeFalsy();
      });
    });

    describe('Subscription', () => {
      test('should return the correct name for subscription', () => {
        const definition = <OperationDefinitionNode>documents.definitions[2];
        const codegen = handleOperation(testSchema, definition, primitivesMap);

        expect(codegen.name).toBe('OnCommentAddedSubscription');
      });

      test('should return the correct booleans for subscription', () => {
        const definition = <OperationDefinitionNode>documents.definitions[2];
        const codegen = handleOperation(testSchema, definition, primitivesMap);

        expect(codegen.isSubscription).toBeTruthy();
        expect(codegen.isMutation).toBeFalsy();
        expect(codegen.isQuery).toBeFalsy();
        expect(codegen.isFragment).toBeFalsy();
      });
    });

    describe('buildVariables', () => {
      test('should return the correct variables names for query', () => {
        const definition = <OperationDefinitionNode>documents.definitions[0];

        expect(buildVariables(testSchema, definition, primitivesMap).map(item => item.name)).toEqual(['repoFullName', 'limit', 'offset']);
      });

      test('should return the correct types for variables for query', () => {
        const definition = <OperationDefinitionNode>documents.definitions[0];

        expect(buildVariables(testSchema, definition, primitivesMap).map(item => item.type)).toEqual(['string', 'number', 'number']);
      });

      test('should return the correct required indication for query', () => {
        const definition = <OperationDefinitionNode>documents.definitions[0];

        expect(buildVariables(testSchema, definition, primitivesMap).map(item => item.isRequired)).toEqual([true, false, false]);
      });
    });
  });
});
