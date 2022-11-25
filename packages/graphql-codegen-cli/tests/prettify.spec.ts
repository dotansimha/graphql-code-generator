import { prettify } from '../src/prettify.js';

describe('prettify', () => {
  afterEach(() => {
    jest.resetAllMocks();
  });

  test('prettify content', async () => {
    const result = await prettify(
      `
      export
          default
            42
      `,
      './demo.js'
    );
    expect(result).toBe('export default 42;\n');
  });
});
