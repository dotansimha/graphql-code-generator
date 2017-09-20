import { debugLog, introspectionQuery, IntrospectionQuery } from 'graphql-codegen-core';
import * as request from 'request';

export const introspectionFromUrl = (url: string, headers: string[]): Promise<IntrospectionQuery> => {
  debugLog(`Loading GraphQL Introspection from remote: ${url}...`);

  let splittedHeaders = (headers || []).map((header: string) => {
    const result = header.match(/^(.*?)[:=]{1}(.*?)$/);

    if (result && result.length > 0) {
      const name = result[1];
      const value = result[2];

      return {
        [name]: value,
      };
    }

    return null;
  }).filter(item => item);

  let extraHeaders = {
    'Accept': 'application/json',
    'Content-Type': 'application/json',
    ...(splittedHeaders.reduce((prev, item) => ({ ...prev, ...item }), {}))
  };

  debugLog(`Executing POST to ${url} with headers: `, extraHeaders);

  return new Promise<IntrospectionQuery>((resolve, reject) => {
    request.post({
      url: url,
      json: {
        query: introspectionQuery.replace('locations', '')
      },
      headers: extraHeaders,
    }, (err, response, body) => {
      if (err) {
        reject(err);

        return;
      }

      const bodyJson = body.data;

      if (!bodyJson || (body.errors && body.errors.length > 0)) {
        reject('Unable to download schema from remote: ' + body.errors.map(item => item.message).join(', '));

        return;
      }

      resolve(bodyJson);
    });
  });
};
