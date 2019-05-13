import * as Types from '../types';

export type OnCommentAddedSubscriptionVariables = {
  repoFullName: Types.Maybe<Types.Scalars['String']>
};


export type OnCommentAddedSubscription = ({ __typename?: 'Subscription' } & { commentAdded: Types.Maybe<({ __typename?: 'Comment' } & Pick<Types.Comment, 'id' | 'createdAt' | 'content'> & { postedBy: Types.Maybe<({ __typename?: 'User' } & Pick<Types.User, 'login' | 'html_url'>)> })> });
