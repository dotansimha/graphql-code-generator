import graphql from 'graphql-tag';

export const booksQuery = graphql`
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
