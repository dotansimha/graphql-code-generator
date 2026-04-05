import { flatten, groupBy, unique } from '../src/utils';

describe('utils', () => {
  describe('flatten', () => {
    it('should flatten a nested array', () => {
      const array = [
        [1, 2, 3],
        [4, 5, 6],
        [7, 8, 9],
      ];
      const actual = flatten(array);
      const expected = [1, 2, 3, 4, 5, 6, 7, 8, 9];
      expect(actual).toEqual(expected);
    });
  });

  describe('groupBy', () => {
    it('should group by a property', () => {
      const array = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
      const actual = groupBy(array, i => i % 2);
      const expected = { 0: [2, 4, 6, 8, 10], 1: [1, 3, 5, 7, 9] };
      expect(actual).toEqual(expected);
    });
  });

  describe('unique', () => {
    it('should return unique items when no key selector is passed', () => {
      const array = [1, 2, 3, 1, 2, 4];
      const actual = unique(array);
      const expected = [1, 2, 3, 4];
      expect(actual).toEqual(expected);
    });

    it('should return unique items based on key selector', () => {
      const array = [
        { id: 1, name: 'Alice' },
        { id: 2, name: 'Bob' },
        { id: 1, name: 'Alice #2' },
        { id: 3, name: 'Charlie' },
      ];

      const actual = unique(array, item => item.id);
      const expected = [
        { id: 1, name: 'Alice' },
        { id: 2, name: 'Bob' },
        { id: 3, name: 'Charlie' },
      ];

      expect(actual).toEqual(expected);
    });
  });
});
