import { toFragmentName } from './to-fragment-name';
import { gql } from './gql';

export function generateFragments(fragments: any, options: any): string {
  const cachedFragments: Record<string, any> = {};

  if (fragments) {
    return fragments.map(fragment => generateFragment(fragment, options)).join('\n');
  } else {
    return '';
  }

  function generateFragment(fragment: any, options: any): string {
    const cached = cachedFragments[fragment.name];

    if (!cached) {
      cachedFragments[fragment.name] = fragment;

      return `
          const ${toFragmentName(fragment.name)} = ${gql(fragment, options)};
      `;
    } else {
      if (fragment.document !== cached.document) {
        throw new Error(`Duplicated fragment called '${fragment.name}'`);
      }
    }
  }
}
