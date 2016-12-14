import {IntrospectionQuery} from 'graphql/utilities/introspectionQuery';
import request = require('request');
import {introspectionQuery} from 'graphql/utilities/introspectionQuery';

export const introspectionFromUrl = (url: string): Promise<IntrospectionQuery> => {
  return new Promise<IntrospectionQuery>((resolve, reject) => {
    request.post({
      url: url,
      json: {
        query: introspectionQuery
      },
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      }
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
