import { debugLog, introspectionQuery, IntrospectionQuery } from 'graphql-codegen-core';
import * as request from 'request';

export const introspectionFromUrl = (url: string, headers: string[]): Promise<IntrospectionQuery> => {
  console.log(`Loading GraphQL Introspection from remote: ${url}...`);

  let splittedHeaders = (headers || []).map((header: string) => {
    const [name, value] = header.split(/\s*:\s*/);

    return {
      [name]: value
    };
  });

  let extraHeaders = {};

  if (splittedHeaders.length > 0) {
    extraHeaders = splittedHeaders.reduce((a, b) => {
      return Object.assign({}, a, b);
    });
  }

  debugLog(`Executing POST to ${url} with headers: `, splittedHeaders);

  return new Promise<IntrospectionQuery>((resolve, reject) => {
    request.post({
      url: url,
      json: {
        query: introspectionQuery.replace('locations', '')
      },
      headers: Object.assign({
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      }, extraHeaders)
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
