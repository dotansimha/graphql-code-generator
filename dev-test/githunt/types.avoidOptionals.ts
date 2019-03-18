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
          limit: Maybe<Scalars['Int']>,
  offset: Maybe<Scalars['Int']>
        };

export enum FeedType {
          Hot = 'HOT',
  New = 'NEW',
  Top = 'TOP'
        }

export type Mutation = {
          submitRepository: Maybe<Entry>,
  vote: Maybe<Entry>,
  submitComment: Maybe<Comment>,
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
          feed: Maybe<Array<Maybe<Entry>>>,
  entry: Maybe<Entry>,
  currentUser: Maybe<User>,
        };


export type QueryFeedArgs = {
          type: FeedType,
  offset: Maybe<Scalars['Int']>,
  limit: Maybe<Scalars['Int']>
        };


export type QueryEntryArgs = {
          repoFullName: Scalars['String']
        };

export type Repository = {
          name: Scalars['String'],
  full_name: Scalars['String'],
  description: Maybe<Scalars['String']>,
  html_url: Scalars['String'],
  stargazers_count: Scalars['Int'],
  open_issues_count: Maybe<Scalars['Int']>,
  owner: Maybe<User>,
        };

export type Subscription = {
          commentAdded: Maybe<Comment>,
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
  limit: Maybe<Scalars['Int']>,
  offset: Maybe<Scalars['Int']>
        };


export type CommentQuery = ({ __typename?: 'Query' } & { currentUser: Maybe<({ __typename?: 'User' } & Pick<User, 'login' | 'html_url'>)>, entry: Maybe<({ __typename?: 'Entry' } & Pick<Entry, 'id' | 'createdAt' | 'commentCount'> & { postedBy: ({ __typename?: 'User' } & Pick<User, 'login' | 'html_url'>), comments: Array<Maybe<({ __typename?: 'Comment' } & CommentsPageCommentFragment)>>, repository: ({ __typename?: 'Repository' } & Pick<Repository, 'full_name' | 'html_url'> & (({ __typename?: 'Repository' } & Pick<Repository, 'description' | 'open_issues_count' | 'stargazers_count'>))) })> });

export type CommentsPageCommentFragment = ({ __typename?: 'Comment' } & Pick<Comment, 'id' | 'createdAt' | 'content'> & { postedBy: ({ __typename?: 'User' } & Pick<User, 'login' | 'html_url'>) });

export type CurrentUserForProfileQueryVariables = {};


export type CurrentUserForProfileQuery = ({ __typename?: 'Query' } & { currentUser: Maybe<({ __typename?: 'User' } & Pick<User, 'login' | 'avatar_url'>)> });

export type FeedEntryFragment = ({ __typename?: 'Entry' } & Pick<Entry, 'id' | 'commentCount'> & { repository: ({ __typename?: 'Repository' } & Pick<Repository, 'full_name' | 'html_url'> & { owner: Maybe<({ __typename?: 'User' } & Pick<User, 'avatar_url'>)> }) } & (VoteButtonsFragment & RepoInfoFragment));

export type FeedQueryVariables = {
          type: FeedType,
  offset: Maybe<Scalars['Int']>,
  limit: Maybe<Scalars['Int']>
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
