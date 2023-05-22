/* eslint-disable @typescript-eslint/ban-ts-comment */

//@ts-ignore
const episodeFragment = gql(/* GraphQL */ `
  fragment EpisodeFragment on Episode {
    id
    title
    show {
      id
      title
    }
    releaseDate
    __typename
  }
`);

//@ts-ignore
const movieFragment = gql(/* GraphQL */ `
  fragment MovieFragment on Movie {
    id
    title
    collection {
      id
    }
    releaseDate
    __typename
  }
`);

//@ts-ignore
const videoDetailsFragment = gql(/* GraphQL */ `
  fragment DetailsFragment on Video {
    title
    __typename
    ...MovieFragment
    ...EpisodeFragment
  }
`);

//@ts-ignore
const videoQueryDocument = gql(/* GraphQL */ `
  query Video($id: ID!) {
    video(id: $id) {
      ...DetailsFragment
      __typename
    }
  }
`);
