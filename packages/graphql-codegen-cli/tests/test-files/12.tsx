import * as React from 'react';
import gql from 'graphql-tag';

export default class extends React.Component<{}, {}> {
  public render() {
    return <div />;
  }
}

export const pageQuery = gql`
  query IndexQuery {
    site {
      siteMetadata {
        title
      }
    }
  }
`;

// export const pageQuery = gql`
//   query IndexQuery {
//     site {
//       siteMetadata {
//         title
//       }
//     }
//   }
// `;
