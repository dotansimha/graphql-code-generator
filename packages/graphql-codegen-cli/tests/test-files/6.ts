import gql from 'graphql-tag';

export const articleDetailQuery = gql`
  query ArticleDetail {
    Article(id: "thisisnotarealID") {
      title
    }
  }
`;
