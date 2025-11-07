/* eslint-disable */
import * as types from './graphql';

/**
 * Map of all GraphQL operations in the project.
 *
 * This map has several performance disadvantages:
 * 1. It is not tree-shakeable, so it will include all operations in the project.
 * 2. It is not minifiable, so the string of a GraphQL query will be multiple times inside the bundle.
 * 3. It does not support dead code elimination, so it will add unused operations.
 *
 * Therefore it is highly recommended to use the babel or swc plugin for production.
 * Learn more about it here: https://the-guild.dev/graphql/codegen/plugins/presets/preset-client#reducing-bundle-size
 */
type Documents = {
  '\n  query allFilmsWithVariablesQuery($first: Int!) {\n    allFilms(first: $first) {\n      edges {\n        node {\n          ...FilmItem\n        }\n      }\n    }\n  }\n': typeof types.AllFilmsWithVariablesQueryDocument;
  '\n  fragment FilmItem on Film {\n    id\n    title\n    releaseDate\n    producers\n  }\n': typeof types.FilmItemFragmentDoc;
};
const documents: Documents = {
  '\n  query allFilmsWithVariablesQuery($first: Int!) {\n    allFilms(first: $first) {\n      edges {\n        node {\n          ...FilmItem\n        }\n      }\n    }\n  }\n':
    types.AllFilmsWithVariablesQueryDocument,
  '\n  fragment FilmItem on Film {\n    id\n    title\n    releaseDate\n    producers\n  }\n':
    types.FilmItemFragmentDoc,
};

/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(
  source: '\n  query allFilmsWithVariablesQuery($first: Int!) {\n    allFilms(first: $first) {\n      edges {\n        node {\n          ...FilmItem\n        }\n      }\n    }\n  }\n'
): typeof import('./graphql').AllFilmsWithVariablesQueryDocument;
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(
  source: '\n  fragment FilmItem on Film {\n    id\n    title\n    releaseDate\n    producers\n  }\n'
): typeof import('./graphql').FilmItemFragmentDoc;

export function graphql(source: string) {
  return (documents as any)[source] ?? {};
}
