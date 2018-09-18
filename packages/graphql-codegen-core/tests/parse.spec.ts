import { Source } from 'graphql';
import { parse } from '../src/utils/parse';

describe('parse', () => {
  test('include file path', () => {
    const query = `
      query Feed {
        feed($type) {
          id
        }
      }
    `;
    const filepath = '../path/to/file';
    const source = new Source(query, filepath);

    expect(() => {
      parse(source);
    }).toThrowError(new RegExp(filepath));
  });

  test('include subset of a document', () => {
    const query = `
      query Feed {
        feed($type) {
          id
        }
      }
    `;

    expect(() => {
      parse(query);
    }).toThrow(/query Feed \{/);
  });
});
