import * as React from 'react';
import graphql from 'graphql-tag';

export default class extends React.Component<{}, {}> {
  public render() {
    return <div />;
  }
}

export const pageQuery = graphql`
  query IndexQuery {
    site {
      siteMetadata {
        title
      }
    }
  }
`;

// export const pageQuery = graphql`
//   query IndexQuery {
//     site {
//       siteMetadata {
//         title
//       }
//     }
//   }
// `;
