// tslint:disable
import * as Types from './types.d';

import gql from 'graphql-tag';

    declare global { 
      export type CommentsPageCommentFragment = ({ __typename?: 'Comment' } & Pick<Types.Comment, 'id' | 'createdAt' | 'content'> & { postedBy: ({ __typename?: 'User' } & Pick<Types.User, 'login' | 'html_url'>) });
 
    }
          
export const CommentsPageCommentFragmentDoc = gql`
    fragment CommentsPageComment on Comment {
  id
  postedBy {
    login
    html_url
  }
  createdAt
  content
}
    `;