import { parseConfigFile } from '../src/yml';
import { generate } from '../src/new-generator';

describe('New Generator API', () => {
  it('should read config file correctly', async () => {
    const yml = `
      schema:
        - ./tests/test-schema.graphql
      generates:
        server/types.ts:
          schema:
            - ./tests/additional-schema.graphql
          plugins:
            - typescript-common
            - typescript-server
        client/types.ts:
          schema:
            - ./tests/test-documents/schema.graphql
          documents:
            - ./tests/test-documents/valid.graphql
          plugins:  
            - typescript-common
            - typescript-client
    `;
    const config = parseConfigFile(yml);
    const result = await generate(config);
  });
});
