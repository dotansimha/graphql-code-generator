import gqlTag from 'graphql-tag';
import { toFragmentName } from './to-fragment-name';
import { removeNgModule } from './ngmodule-directive';

export function gql(operation, options: any): string {
  const config = options.data.root.config || {};

  const doc = `
    ${removeNgModule(operation.document)}
    ${includeFragments(transformFragments(operation.document))}
  `;

  return config.noGraphqlTag ? JSON.stringify(gqlTag(doc)) : 'gql`' + doc + '`';
}

function includeFragments(fragments: string[]): string {
  if (fragments) {
    return `
      ${fragments
        .filter((name, i, all) => all.indexOf(name) === i)
        .map(name => '${' + name + '}')
        .join('\n')}
    `;
  }

  return '';
}

export function extractFragments(document: string): string[] | undefined {
  return (document.match(/\.\.\.[a-z0-9\_]+/gi) || []).map(name => name.replace('...', ''));
}

function transformFragments(document: string): string[] | undefined {
  return extractFragments(document).map(toFragmentName);
}
