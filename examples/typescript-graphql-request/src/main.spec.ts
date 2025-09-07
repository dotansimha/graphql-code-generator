import { describe, it, expect } from 'vitest';
import { getPeople } from './main';

describe('TypeScript GraphQL Request tests', () => {
  it('works without variables', async () => {
    const result = await getPeople();
    expect(result?.map(o => o?.node?.name)).toContain('Luke Skywalker');
  });

  it('returns first 3 entries', async () => {
    const result = await getPeople(3);
    expect(result).toHaveLength(3);
  });
});
