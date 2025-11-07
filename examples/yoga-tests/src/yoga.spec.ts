import { describe, it, expect } from 'vitest';
import type { TypedDocumentNode } from '@graphql-typed-document-node/core';
import { type ExecutionResult, print } from 'graphql';
import { graphql } from './gql';
import { yoga } from './yoga';

function executeOperation<TResult, TVariables>(
  operation: TypedDocumentNode<TResult, TVariables>,
  ...[variables]: TVariables extends Record<string, never> ? [] : [TVariables]
): Promise<ExecutionResult<TResult>> {
  return Promise.resolve(
    yoga.fetch('http://yoga/graphql', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify({
        query: print(operation),
        variables: variables ?? undefined,
      }),
    })
  ).then(response => response.json());
}

describe('Yoga Tests', () => {
  it('execute query operation', async () => {
    const HelloQuery = graphql(/* GraphQL */ `
      query HelloQuery {
        hello
      }
    `);

    const result = await executeOperation(HelloQuery);

    expect(result.data?.hello).toEqual('Hello world!');
  });

  it('execute mutation operation', async () => {
    const EchoMutation = graphql(/* GraphQL */ `
      mutation EchoMutation($message: String!) {
        echo(message: $message)
      }
    `);

    const result = await executeOperation(EchoMutation, {
      message: 'Ohayoo!',
    });

    expect(result.data?.echo).toEqual('Ohayoo!');
  });

  it('execute mutation operation (variant)', async () => {
    const EchoMutation = graphql(/* GraphQL */ `
      mutation EchoMutation($message: String!) {
        echo(message: $message)
      }
    `);

    const result = await executeOperation(EchoMutation, {
      message: 'Konbanwa',
    });

    expect(result.data?.echo).toEqual('Konbanwa');
  });
});
