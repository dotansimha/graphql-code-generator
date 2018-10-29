import { parseConfigFile } from '../src/yml';
import { generate } from '../src/new-generator';

describe('New Generator API', () => {
  it('should read config file correctly', async () => {
    const yml = `
      schema:
        - ./tests/test-documents/schema.graphql
      generates:
        types.ts:
          - typescript-mongodb
    `;
    const config = parseConfigFile(yml);
    const result = await generate(config);
  });
});
