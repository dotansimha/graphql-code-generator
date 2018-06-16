import gql from 'graphql-tag';

export const booksQuery = gql`
  {
    books {
      isbn
      title
      description
      rating
      thumbnails {
        url
      }
    }
  }
`;
