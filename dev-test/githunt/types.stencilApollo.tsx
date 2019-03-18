// tslint:disable
type Maybe<T> = T | null;
export type Scalars = {
          ID: string,
  String: string,
  Boolean: boolean,
  Int: number,
  Float: number,
        };

export type Comment = {
          id: Scalars['Int'],
  postedBy: User,
  createdAt: Scalars['Float'],
  content: Scalars['String'],
  repoName: Scalars['String'],
        };

export type Entry = {
          repository: Repository,
  postedBy: User,
  createdAt: Scalars['Float'],
  score: Scalars['Int'],
  hotScore: Scalars['Float'],
  comments: Array<Maybe<Comment>>,
  commentCount: Scalars['Int'],
  id: Scalars['Int'],
  vote: Vote,
        };


export type EntryCommentsArgs = {
          limit?: Maybe<Scalars['Int']>,
  offset?: Maybe<Scalars['Int']>
        };

export enum FeedType {
          Hot = 'HOT',
  New = 'NEW',
  Top = 'TOP'
        }

export type Mutation = {
          submitRepository?: Maybe<Entry>,
  vote?: Maybe<Entry>,
  submitComment?: Maybe<Comment>,
        };


export type MutationSubmitRepositoryArgs = {
          repoFullName: Scalars['String']
        };


export type MutationVoteArgs = {
          repoFullName: Scalars['String'],
  type: VoteType
        };


export type MutationSubmitCommentArgs = {
          repoFullName: Scalars['String'],
  commentContent: Scalars['String']
        };

export type Query = {
          feed?: Maybe<Array<Maybe<Entry>>>,
  entry?: Maybe<Entry>,
  currentUser?: Maybe<User>,
        };


export type QueryFeedArgs = {
          type: FeedType,
  offset?: Maybe<Scalars['Int']>,
  limit?: Maybe<Scalars['Int']>
        };


export type QueryEntryArgs = {
          repoFullName: Scalars['String']
        };

export type Repository = {
          name: Scalars['String'],
  full_name: Scalars['String'],
  description?: Maybe<Scalars['String']>,
  html_url: Scalars['String'],
  stargazers_count: Scalars['Int'],
  open_issues_count?: Maybe<Scalars['Int']>,
  owner?: Maybe<User>,
        };

export type Subscription = {
          commentAdded?: Maybe<Comment>,
        };


export type SubscriptionCommentAddedArgs = {
          repoFullName: Scalars['String']
        };

export type User = {
          login: Scalars['String'],
  avatar_url: Scalars['String'],
  html_url: Scalars['String'],
        };

export type Vote = {
          vote_value: Scalars['Int'],
        };

export enum VoteType {
          Up = 'UP',
  Down = 'DOWN',
  Cancel = 'CANCEL'
        }
export type OnCommentAddedSubscriptionVariables = {
          repoFullName: Scalars['String']
        };


export type OnCommentAddedSubscription = ({ __typename?: 'Subscription' } & { commentAdded: Maybe<({ __typename?: 'Comment' } & Pick<Comment, 'id' | 'createdAt' | 'content'> & { postedBy: ({ __typename?: 'User' } & Pick<User, 'login' | 'html_url'>) })> });

export type CommentQueryVariables = {
          repoFullName: Scalars['String'],
  limit?: Maybe<Scalars['Int']>,
  offset?: Maybe<Scalars['Int']>
        };


export type CommentQuery = ({ __typename?: 'Query' } & { currentUser: Maybe<({ __typename?: 'User' } & Pick<User, 'login' | 'html_url'>)>, entry: Maybe<({ __typename?: 'Entry' } & Pick<Entry, 'id' | 'createdAt' | 'commentCount'> & { postedBy: ({ __typename?: 'User' } & Pick<User, 'login' | 'html_url'>), comments: Array<Maybe<({ __typename?: 'Comment' } & CommentsPageCommentFragment)>>, repository: ({ __typename?: 'Repository' } & Pick<Repository, 'full_name' | 'html_url'> & (({ __typename?: 'Repository' } & Pick<Repository, 'description' | 'open_issues_count' | 'stargazers_count'>))) })> });

export type CommentsPageCommentFragment = ({ __typename?: 'Comment' } & Pick<Comment, 'id' | 'createdAt' | 'content'> & { postedBy: ({ __typename?: 'User' } & Pick<User, 'login' | 'html_url'>) });

export type CurrentUserForProfileQueryVariables = {};


export type CurrentUserForProfileQuery = ({ __typename?: 'Query' } & { currentUser: Maybe<({ __typename?: 'User' } & Pick<User, 'login' | 'avatar_url'>)> });

export type FeedEntryFragment = ({ __typename?: 'Entry' } & Pick<Entry, 'id' | 'commentCount'> & { repository: ({ __typename?: 'Repository' } & Pick<Repository, 'full_name' | 'html_url'> & { owner: Maybe<({ __typename?: 'User' } & Pick<User, 'avatar_url'>)> }) } & (VoteButtonsFragment & RepoInfoFragment));

export type FeedQueryVariables = {
          type: FeedType,
  offset?: Maybe<Scalars['Int']>,
  limit?: Maybe<Scalars['Int']>
        };


export type FeedQuery = ({ __typename?: 'Query' } & { currentUser: Maybe<({ __typename?: 'User' } & Pick<User, 'login'>)>, feed: Maybe<Array<Maybe<({ __typename?: 'Entry' } & FeedEntryFragment)>>> });

export type SubmitRepositoryMutationVariables = {
          repoFullName: Scalars['String']
        };


export type SubmitRepositoryMutation = ({ __typename?: 'Mutation' } & { submitRepository: Maybe<({ __typename?: 'Entry' } & Pick<Entry, 'createdAt'>)> });

export type RepoInfoFragment = ({ __typename?: 'Entry' } & Pick<Entry, 'createdAt'> & { repository: ({ __typename?: 'Repository' } & Pick<Repository, 'description' | 'stargazers_count' | 'open_issues_count'>), postedBy: ({ __typename?: 'User' } & Pick<User, 'html_url' | 'login'>) });

export type SubmitCommentMutationVariables = {
          repoFullName: Scalars['String'],
  commentContent: Scalars['String']
        };


export type SubmitCommentMutation = ({ __typename?: 'Mutation' } & { submitComment: Maybe<({ __typename?: 'Comment' } & CommentsPageCommentFragment)> });

export type VoteButtonsFragment = ({ __typename?: 'Entry' } & Pick<Entry, 'score'> & { vote: ({ __typename?: 'Vote' } & Pick<Vote, 'vote_value'>) });

export type VoteMutationVariables = {
          repoFullName: Scalars['String'],
  type: VoteType
        };


export type VoteMutation = ({ __typename?: 'Mutation' } & { vote: Maybe<({ __typename?: 'Entry' } & Pick<Entry, 'score' | 'id'> & { vote: ({ __typename?: 'Vote' } & Pick<Vote, 'vote_value'>) })> });

import gql from 'graphql-tag';
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
export const VoteButtonsFragmentDoc = gql`
    fragment VoteButtons on Entry {
  score
  vote {
    vote_value
  }
}
    `;
export const RepoInfoFragmentDoc = gql`
    fragment RepoInfo on Entry {
  createdAt
  repository {
    description
    stargazers_count
    open_issues_count
  }
  postedBy {
    html_url
    login
  }
}
    `;
export const FeedEntryFragmentDoc = gql`
    fragment FeedEntry on Entry {
  id
  commentCount
  repository {
    full_name
    html_url
    owner {
      avatar_url
    }
  }
  ...VoteButtons
  ...RepoInfo
}
    ${VoteButtonsFragmentDoc}
${RepoInfoFragmentDoc}`;
export const OnCommentAddedDocument = gql`
    subscription onCommentAdded($repoFullName: String!) {
  commentAdded(repoFullName: $repoFullName) {
    id
    postedBy {
      login
      html_url
    }
    createdAt
    content
  }
}
    `;

        export type OnCommentAddedProps = {
            variables ?: OnCommentAddedSubscriptionVariables;
            onReady ?: import('stencil-apollo/dist/types/components/apollo-subscription/types').OnSubscriptionReadyFn<OnCommentAddedSubscription, OnCommentAddedSubscriptionVariables>;
        };
      

        export const OnCommentAddedComponent = (props: OnCommentAddedProps) => <apollo-subscription subscription={ OnCommentAddedDocument } { ...props } />;
      
export const CommentDocument = gql`
    query Comment($repoFullName: String!, $limit: Int, $offset: Int) {
  currentUser {
    login
    html_url
  }
  entry(repoFullName: $repoFullName) {
    id
    postedBy {
      login
      html_url
    }
    createdAt
    comments(limit: $limit, offset: $offset) {
      ...CommentsPageComment
    }
    commentCount
    repository {
      full_name
      html_url
      ... on Repository {
        description
        open_issues_count
        stargazers_count
      }
    }
  }
}
    ${CommentsPageCommentFragmentDoc}`;

        export type CommentProps = {
            variables ?: CommentQueryVariables;
            onReady ?: import('stencil-apollo/dist/types/components/apollo-query/types').OnQueryReadyFn<CommentQuery, CommentQueryVariables>;
        };
      

        export const CommentComponent = (props: CommentProps) => <apollo-query query={ CommentDocument } { ...props } />;
      
export const CurrentUserForProfileDocument = gql`
    query CurrentUserForProfile {
  currentUser {
    login
    avatar_url
  }
}
    `;

        export type CurrentUserForProfileProps = {
            variables ?: CurrentUserForProfileQueryVariables;
            onReady ?: import('stencil-apollo/dist/types/components/apollo-query/types').OnQueryReadyFn<CurrentUserForProfileQuery, CurrentUserForProfileQueryVariables>;
        };
      

        export const CurrentUserForProfileComponent = (props: CurrentUserForProfileProps) => <apollo-query query={ CurrentUserForProfileDocument } { ...props } />;
      
export const FeedDocument = gql`
    query Feed($type: FeedType!, $offset: Int, $limit: Int) {
  currentUser {
    login
  }
  feed(type: $type, offset: $offset, limit: $limit) {
    ...FeedEntry
  }
}
    ${FeedEntryFragmentDoc}`;

        export type FeedProps = {
            variables ?: FeedQueryVariables;
            onReady ?: import('stencil-apollo/dist/types/components/apollo-query/types').OnQueryReadyFn<FeedQuery, FeedQueryVariables>;
        };
      

        export const FeedComponent = (props: FeedProps) => <apollo-query query={ FeedDocument } { ...props } />;
      
export const SubmitRepositoryDocument = gql`
    mutation submitRepository($repoFullName: String!) {
  submitRepository(repoFullName: $repoFullName) {
    createdAt
  }
}
    `;

        export type SubmitRepositoryProps = {
            variables ?: SubmitRepositoryMutationVariables;
            onReady ?: import('stencil-apollo/dist/types/components/apollo-mutation/types').OnMutationReadyFn<SubmitRepositoryMutation, SubmitRepositoryMutationVariables>;
        };
      

        export const SubmitRepositoryComponent = (props: SubmitRepositoryProps) => <apollo-mutation mutation={ SubmitRepositoryDocument } { ...props } />;
      
export const SubmitCommentDocument = gql`
    mutation submitComment($repoFullName: String!, $commentContent: String!) {
  submitComment(repoFullName: $repoFullName, commentContent: $commentContent) {
    ...CommentsPageComment
  }
}
    ${CommentsPageCommentFragmentDoc}`;

        export type SubmitCommentProps = {
            variables ?: SubmitCommentMutationVariables;
            onReady ?: import('stencil-apollo/dist/types/components/apollo-mutation/types').OnMutationReadyFn<SubmitCommentMutation, SubmitCommentMutationVariables>;
        };
      

        export const SubmitCommentComponent = (props: SubmitCommentProps) => <apollo-mutation mutation={ SubmitCommentDocument } { ...props } />;
      
export const VoteDocument = gql`
    mutation vote($repoFullName: String!, $type: VoteType!) {
  vote(repoFullName: $repoFullName, type: $type) {
    score
    id
    vote {
      vote_value
    }
  }
}
    `;

        export type VoteProps = {
            variables ?: VoteMutationVariables;
            onReady ?: import('stencil-apollo/dist/types/components/apollo-mutation/types').OnMutationReadyFn<VoteMutation, VoteMutationVariables>;
        };
      

        export const VoteComponent = (props: VoteProps) => <apollo-mutation mutation={ VoteDocument } { ...props } />;
      