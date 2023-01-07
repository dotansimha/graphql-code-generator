import { plugin } from '../src/index.js';

describe('Time', () => {
  it('Should use default comment when extension is unknown', async () => {
    const result = await plugin(null as any, [], null, { outputFile: null });
    expect(result).toContain('// Generated on');
  });

  it('Should use # prefix for comment when extension is graphql', async () => {
    const result = await plugin(null as any, [], null, { outputFile: 'schema.graphql' });
    expect(result).toContain('# Generated on');
  });
});
