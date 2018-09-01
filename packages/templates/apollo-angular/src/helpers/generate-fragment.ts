import { toFragmentName } from './to-fragment-name';
import { gql } from './gql';

const cachedFragments: Record<string, any> = {};

export function generateFragment(fragment: any, options: any): string {
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
