import { GraphQLSchema } from 'graphql';
import { createYoga } from 'graphql-yoga';
import nock from 'nock';

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
  const yoga = createYoga({ schema, logging: false });

  const handler = async function (this: nock.ReplyFnContext, uri: string, body: any) {
    if (intercept) {
      intercept(this);
    }
    // Create a generic Request object that can be consumed by Yoga's fetch API
    const request = new Request(new URL(host + uri), {
      method,
      headers: this.req.headers as HeadersInit,
      body: method === 'GET' ? undefined : JSON.stringify(body),
    });

    const response = await yoga.fetch(request);

    const headers: Record<string, string> = {};
    for (const [name, value] of response.headers) {
      headers[name] = value;
    }

    return [response.status, await response.json(), headers];
  };
  switch (method) {
    case 'GET':
      return nock(host).get(path).reply(handler);
    case 'POST':
      return nock(host).post(path).reply(handler);
  }
  return null;
}
