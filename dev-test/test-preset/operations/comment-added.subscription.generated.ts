import * as Types from '../types';

type Maybe<T> = T | null;

export type OnCommentAddedSubscriptionVariables = {
  repoFullName: Types.Scalars['String']
};


export type OnCommentAddedSubscription = ({ __typename?: 'Subscription' } & { commentAdded: Maybe<({ __typename?: 'Comment' } & Pick<Types.Comment, 'id' | 'createdAt' | 'content'> & { postedBy: ({ __typename?: 'User' } & Pick<Types.User, 'login' | 'html_url'>) })> });
