import { parseConfigFile } from '../src/yml';
import { generate } from '../src/new-generator';

describe('New Generator API', () => {
  it('should read config file correctly', async () => {
    const yml = `
      schema:
        - ./tests/test-documents/schema.graphql
      generates:
        schema.graphql:
          - time:
              format: "HH:ss"
              message: "boop in "
          - add: "0import * as g from 'graphql'; "
          - schema-ast
          - add:
            - "1import * as g from 'graphql'; "
            - "2import * as g from 'graphql'; "

    `;
    const config = parseConfigFile(yml);
    const result = await generate(config);
  });
});
