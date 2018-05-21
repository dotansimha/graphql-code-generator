import graphql from 'graphql-tag';

export const articleDetailQuery = graphql`
  query ArticleDetail {
    Article(id: "thisisnotarealID") {
      title
    }
  }
`;
