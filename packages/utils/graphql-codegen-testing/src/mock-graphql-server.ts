import { GraphQLSchema } from 'graphql';
import nock from 'nock';
import { getGraphQLParameters, processRequest as processGraphQLHelixRequest } from 'graphql-helix';

export function mockGraphQLServer({
  schema,
  host,
  path,
  intercept,
  method = 'POST',
}: {
  schema: GraphQLSchema;
  host: string;
  path: string | RegExp | ((path: string) => boolean);
  intercept?: (obj: nock.ReplyFnContext) => void;
  method?: string;
}) {
  const handler = async function (this: nock.ReplyFnContext, uri: string, body: any) {
    if (intercept) {
      intercept(this);
    }
    const uriObj = new URL(host + uri);
    const queryObj: any = {};
    uriObj.searchParams.forEach((val, key) => (queryObj[key] = val));
    // Create a generic Request object that can be consumed by Graphql Helix's API
    const request = {
      body,
      headers: this.req.headers,
      method,
      query: queryObj,
    };
    // Extract the GraphQL parameters from the request
    const { operationName, query, variables } = getGraphQLParameters(request);

    // Validate and execute the query
    const result = await processGraphQLHelixRequest({
      operationName,
      query,
      variables,
      request,
      schema,
    });
    // processRequest returns one of three types of results depending on how the server should respond
    // 1) RESPONSE: a regular JSON payload
    // 2) MULTIPART RESPONSE: a multipart response (when @stream or @defer directives are used)
    // 3) PUSH: a stream of events to push back down the client for a subscription
    if (result.type === 'RESPONSE') {
      const headers = {};
      // We set the provided status and headers and just the send the payload back to the client
      result.headers.forEach(({ name, value }) => (headers[name] = value));
      return [result.status, result.payload, headers];
    }
    return [500, 'Not implemented'];
  };
  switch (method) {
    case 'GET':
      return nock(host).get(path).reply(handler);
    case 'POST':
      return nock(host).post(path).reply(handler);
  }
  return null;
}
