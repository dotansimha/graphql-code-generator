import { parse } from 'graphql';
import { plugin } from '../src';

describe('msw', () => {
  const documents = [{ document: parse(`query User { name }`) }, { document: parse(`mutation UpdateUser { name }`) }];

  it('Should generate mocks based on queries and mutations', async () => {
    const result = await plugin(null, documents, {});
    expect(result.content).toContain(
      `export const userQueryHandler = (resolver: ResponseResolver<GraphQLRequest<UserQueryVariables>, GraphQLContext<UserQuery>, any>) =>
  graphql.query<UserQuery, UserQueryVariables>(
    'User',
    resolver
  )`
    );
    expect(result.content).toContain(
      `export const updateUserMutationHandler = (resolver: ResponseResolver<GraphQLRequest<UpdateUserMutationVariables>, GraphQLContext<UpdateUserMutation>, any>) =>
  graphql.mutation<UpdateUserMutation, UpdateUserMutationVariables>(
    'UpdateUser',
    resolver
  )`
    );
    expect(result.prepend).toContain(`import { graphql, ResponseResolver, GraphQLRequest, GraphQLContext } from 'msw'`);
  });

  it.only('Should generate a link with an endpoint', async () => {
    const link = { name: 'api', endpoint: 'http://localhost:3000/graphql' };
    const result = await plugin(null, documents, {
      link,
    });
    expect(result.content).toContain(`const api = graphql.link('http://localhost:3000/graphql')`);

    expect(result.content).toContain(
      `export const updateUserMutationApiHandler = (resolver: ResponseResolver<GraphQLRequest<UpdateUserMutationVariables>, GraphQLContext<UpdateUserMutation>, any>) =>
  api.mutation<UpdateUserMutation, UpdateUserMutationVariables>(
    'UpdateUser',
    resolver
  )`
    );
  });
});
