import gqlTag from 'graphql-tag';
import { toFragmentName } from './to-fragment-name';
import { removeDirectives } from './directives';
import { Operation } from 'graphql-codegen-core';

export const gql = convert => (operation: Operation, operations: Operation[], options: any): string => {
  const config = options.data.root.config || {};
  const noGraphqlTag = config.noGraphqlTag;
  const cleanDoc = removeDirectives(operation.document, ['NgModule', 'namedClient']);

  if (noGraphqlTag) {
    const fragmentNames = extractFragments(operation.document);
    const fragments =
      operations
        .filter(op => fragmentNames.includes(op.name) && !op.operationType)
        .map(f => f.document)
        .join(' ') || '';

    return JSON.stringify(
      gqlTag`
        ${cleanDoc}
        ${fragments}
      `
    );
  }

  const doc = `
    ${cleanDoc}
    ${includeFragments(transformFragments(convert)(operation.document))}
  `;

  return 'gql`' + doc + '`';
};

function includeFragments(fragments: string[]): string;
function includeFragments(fragments: string[], operation: string): string;
function includeFragments(fragments: string[], operation?: string): string | string[] {
  if (fragments && !operation) {
    return `
      ${fragments
        .filter((name, i, all) => all.indexOf(name) === i)
        .map(name => '${' + name + '}')
        .join('\n')}
    `;
  }

  if (fragments && operation) {
  }

  return '';
}

export function extractFragments(document: string): string[] | undefined {
  return (document.match(/\.\.\.[a-z0-9\_]+/gi) || []).map(name => name.replace('...', ''));
}

const transformFragments = convert => (document: string): string[] | undefined => {
  return extractFragments(document).map(toFragmentName(convert));
};
