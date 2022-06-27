import '@graphql-codegen/testing';
import { plugin } from '../src/index.js';
import { parse } from 'graphql';

describe('named-operations-object', () => {
  it('Should generate const strings when useConsts: true is set', async () => {
    const result = await plugin(
      null,
      [
        {
          document: parse(/* GraphQL */ `
            query myQuery {
              id
            }
          `),
        },
      ],
      {
        useConsts: true,
      }
    );

    expect(result).toBeSimilarStringTo(`export const namedOperations = {
      Query: {
        myQuery: 'myQuery' as const
      }
    }`);
  });

  it('Should generate the correct output with a single query', async () => {
    const result = await plugin(
      null,
      [
        {
          document: parse(/* GraphQL */ `
            query myQuery {
              id
            }
          `),
        },
      ],
      {}
    );

    expect(result).toBeSimilarStringTo(`export const namedOperations = {
      Query: {
        myQuery: 'myQuery'
      }
    }`);
  });

  it('Should return empty reuslt when no valid operations', async () => {
    const result = await plugin(
      null,
      [
        {
          document: parse(/* GraphQL */ `
            query {
              id
            }
          `),
        },
      ],
      {}
    );

    expect(result).toBe('');
  });

  it('Should work with fragments', async () => {
    const result = await plugin(
      null,
      [
        {
          document: parse(/* GraphQL */ `
            query myQuery {
              id
            }
          `),
        },
        {
          document: parse(/* GraphQL */ `
            fragment UserFields on User {
              id
            }
          `),
        },
      ],
      {}
    );

    expect(result).toBeSimilarStringTo(`export const namedOperations = {
      Query: {
        myQuery: 'myQuery'
      },
      Fragment: {
        UserFields: 'UserFields'
      }
    }`);
  });

  it('Should return empty reuslt when no operations exists', async () => {
    const result = await plugin(null, [], {});

    expect(result).toBe('');
  });

  it('Should override identifier name', async () => {
    const result = await plugin(
      null,
      [
        {
          document: parse(/* GraphQL */ `
            query myQuery {
              id
            }
          `),
        },
      ],
      { identifierName: 'AllMyOperations' }
    );

    expect(result).toBeSimilarStringTo(`export const AllMyOperations = {
      Query: {
        myQuery: 'myQuery'
      }
    }`);
  });

  it('Should generate the correct output with a multiple operations', async () => {
    const result = await plugin(
      null,
      [
        {
          document: parse(/* GraphQL */ `
            query myQuery {
              id
            }
          `),
        },
        {
          document: parse(/* GraphQL */ `
            mutation doSomething {
              id
            }
          `),
        },
        {
          document: parse(/* GraphQL */ `
            mutation doSomethingElse {
              id
            }
          `),
        },
        {
          document: parse(/* GraphQL */ `
            subscription somethingHappened {
              id
            }
          `),
        },
      ],
      {}
    );

    expect(result).toBeSimilarStringTo(`export const namedOperations = {
      Query: {
        myQuery: 'myQuery'
      },
      Mutation: {
        doSomething: 'doSomething',
        doSomethingElse: 'doSomethingElse'
      },
      Subscription: {
        somethingHappened: 'somethingHappened'
      }
    }`);
  });

  it('Should ignore anonymouse operations', async () => {
    const result = await plugin(
      null,
      [
        {
          document: parse(/* GraphQL */ `
            query {
              id
            }
          `),
        },
        {
          document: parse(/* GraphQL */ `
            mutation doSomething {
              id
            }
          `),
        },
        {
          document: parse(/* GraphQL */ `
            mutation doSomethingElse {
              id
            }
          `),
        },
        {
          document: parse(/* GraphQL */ `
            subscription somethingHappened {
              id
            }
          `),
        },
      ],
      {}
    );

    expect(result).toBeSimilarStringTo(`export const namedOperations = {
      Mutation: {
        doSomething: 'doSomething',
        doSomethingElse: 'doSomethingElse'
      },
      Subscription: {
        somethingHappened: 'somethingHappened'
      }
    }`);
  });
});
