import gqlTag from 'graphql-tag';
import { toFragmentName } from './to-fragment-name';

export function gql(operation, options: any): string {
  const config = options.data.root.config || {};

  const doc = `
    ${operation.document}
    ${includeFragments(extractFragments(operation.document, options))}
  `;

  return config.noGraphqlTag ? JSON.stringify(gqlTag(doc)) : 'gql`' + doc + '`';
}

function includeFragments(fragments: string[]): string {
  if (fragments) {
    return `
      ${fragments.map(name => '${' + name + '}').join('\n')}
    `;
  }

  return '';
}

function extractFragments(document: string, options: any): string[] | undefined {
  return (document.match(/\.\.\.[a-z0-9\_]+/gi) || []).map(name => toFragmentName(name.replace('...', ''), options));
}
