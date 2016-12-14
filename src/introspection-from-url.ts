import {IntrospectionQuery} from 'graphql/utilities/introspectionQuery';
import request = require('request');
import {introspectionQuery} from 'graphql/utilities/introspectionQuery';

export const introspectionFromUrl = (url: string, headers: string[]): Promise<IntrospectionQuery> => {
  let splittedHeaders = headers.map((header: string) => {
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

  return new Promise<IntrospectionQuery>((resolve, reject) => {
    request.post({
      url: url,
      json: {
        query: introspectionQuery
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

      if (!bodyJson || (bodyJson.errors && bodyJson.errors.length > 0)) {
        reject('Unable to download schema from remote: ' + bodyJson.errors.map(item => item.message).join(', '));

        return;
      }

      resolve(bodyJson);
    });
  });
};
