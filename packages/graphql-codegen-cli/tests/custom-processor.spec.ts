import { executeWithOptions } from '../src/codegen';

describe('Custom Processor', () => {
  it('should detect custom processor function correctly', async () => {
    const result = await executeWithOptions({
      schema: '../../dev-test/githunt/schema.json',
      template: './tests/test-files/processor/valid.js'
    });

    expect(result.length).toBe(1);
    expect(result[0].filename).toContain('a.ts');
    expect(result[0].content).toBe('1');
  });

  it('should throw when processor could not be found', async () => {
    let error = null;

    try {
      await executeWithOptions({
        schema: '../../dev-test/githunt/schema.json',
        template: './tests/test-files/processor/not-exists.js'
      });
    } catch (e) {
      error = e;
    }

    expect(error).not.toBeNull();
  });
});
