import { scanForTemplatesInPath } from '../src/loaders/templates-scanner';

describe('scanForTemplatesInPath', () => {
  it('should return the correct files', () => {
    const result = scanForTemplatesInPath('./tests/', ['template']);

    expect(Object.keys(result).length).toBe(1);
  });
});
