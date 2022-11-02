import { GraphQLSchema } from 'graphql';
import nock from 'nock';
import { createYoga } from 'graphql-yoga';

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
  const yoga = createYoga({ schema });

  const handler = async function (this: nock.ReplyFnContext, uri: string, body: any) {
    if (intercept) {
      intercept(this);
    }
    const uriObj = new URL(host + uri);
    const queryObj: any = {};
    uriObj.searchParams.forEach((val, key) => (queryObj[key] = val));
    const request = {
      body: JSON.stringify(body),
      headers: this.req.headers,
      method,
      query: queryObj,
    };

    const response = await yoga.fetch('http://localhost:4000/graphql', request);

    if (response) {
      const headers = {};
      // We set the provided status and headers and just the send the payload back to the client
      response.headers.forEach(([value, name]) => (headers[name] = value));
      return [response.status, await response.json(), headers];
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
