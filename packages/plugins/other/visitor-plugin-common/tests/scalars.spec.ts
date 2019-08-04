import { normalizeScalars } from '../src/scalars';

describe('Scalars', () => {
  it('should normalize all inputs into a valid value', () => {
    const r = normalizeScalars({
      test1: 'a',
      test2: true,
      test3: 10,
      rest4: { t: 1 },
      rest5: [1, 2, 3],
    } as any);

    expect(r).toEqual({
      test1: 'a',
      test2: true,
      test3: 10,
      rest4: '{"t":1}',
      rest5: '[1,2,3]',
    });
  });
});
