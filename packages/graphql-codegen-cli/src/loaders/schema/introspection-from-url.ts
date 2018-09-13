import {
  debugLog,
  introspectionQuery,
  logger,
  introspectionToGraphQLSchema,
  validateIntrospection
} from 'graphql-codegen-core';
import { post } from 'request';
import { SchemaLoader } from './schema-loader';
import { GraphQLSchema } from 'graphql';
import { isUri } from 'valid-url';
import { CLIOptions } from '../../cli-options';

export class IntrospectionFromUrlLoader implements SchemaLoader {
  canHandle(pointerToSchema: string): boolean {
    return !!isUri(pointerToSchema);
  }

  handle(url: string, cliOptions: CLIOptions): Promise<GraphQLSchema> {
    logger.info(`Loading GraphQL Introspection from remote: ${url}...`);

    let splittedHeaders = (cliOptions.header || [])
      .map((header: string) => {
        const result = header.match(/^(.*?)[:=]{1}(.*?)$/);

        if (result && result.length > 0) {
          const name = result[1];
          const value = result[2];

          return {
            [name]: value
          };
        }

        return null;
      })
      .filter(item => item);

    let extraHeaders = {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      ...splittedHeaders.reduce((prev, item) => ({ ...prev, ...item }), {})
    };

    debugLog(`Executing POST to ${url} with headers: `, extraHeaders);

    return new Promise<GraphQLSchema>((resolve, reject) => {
      post(
        {
          url: url,
          json: {
            query: introspectionQuery
          },
          headers: extraHeaders
        },
        (err, response, body) => {
          if (err) {
            reject(err);

            return;
          }

          const bodyJson = body.data;

          let errorMessage;
          if (body.errors && body.errors.length > 0) {
            errorMessage = body.errors.map(item => item.message).join(', ');
          } else if (!bodyJson) {
            errorMessage = body;
          }

          if (errorMessage) {
            reject('Unable to download schema from remote: ' + errorMessage);

            return;
          }

          validateIntrospection(bodyJson);
          resolve(introspectionToGraphQLSchema(bodyJson));
        }
      );
    });
  }
}
