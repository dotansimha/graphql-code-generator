import { parseConfigFile } from '../src/yml';
import { generate } from '../src/new-generator';

describe('New Generator API', () => {
  it('should read config file correctly', async () => {
    const yml = `
      schema:
        - ./tests/test-documents/schema.graphql
      documents:
        - ./tests/test-documents/valid.graphql
      generates:
        client/types.tsx:
          - typescript-react-apollo
    `;
    const config = parseConfigFile(yml);
    const result = await generate(config);
  });
});
