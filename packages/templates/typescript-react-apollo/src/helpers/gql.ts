import gqlTag from 'graphql-tag';

export function gql(document: string): string {
  return JSON.stringify(gqlTag(document));
}
