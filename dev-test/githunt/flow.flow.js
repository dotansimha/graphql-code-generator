/* @flow */


export type Scalars = {
          ID: string,
  String: string,
  Boolean: boolean,
  Int: number,
  Float: number,
        };

export type Comment = {
          id: $ElementType<Scalars, 'Int'>,
  postedBy: User,
  createdAt: $ElementType<Scalars, 'Float'>,
  content: $ElementType<Scalars, 'String'>,
  repoName: $ElementType<Scalars, 'String'>,
        };

export type Entry = {
          repository: Repository,
  postedBy: User,
  createdAt: $ElementType<Scalars, 'Float'>,
  score: $ElementType<Scalars, 'Int'>,
  hotScore: $ElementType<Scalars, 'Float'>,
  comments: Array<?Comment>,
  commentCount: $ElementType<Scalars, 'Int'>,
  id: $ElementType<Scalars, 'Int'>,
  vote: Vote,
        };


export type EntryCommentsArgs = {
          limit?: ?$ElementType<Scalars, 'Int'>,
  offset?: ?$ElementType<Scalars, 'Int'>
        };

export const FeedTypeValues = Object.freeze({
          Hot: 'HOT', 
  New: 'NEW', 
  Top: 'TOP'
        });


export type FeedType = $Values<typeof FeedTypeValues>;

export type Mutation = {
          submitRepository?: ?Entry,
  vote?: ?Entry,
  submitComment?: ?Comment,
        };


export type MutationSubmitRepositoryArgs = {
          repoFullName: $ElementType<Scalars, 'String'>
        };


export type MutationVoteArgs = {
          repoFullName: $ElementType<Scalars, 'String'>,
  type: VoteType
        };


export type MutationSubmitCommentArgs = {
          repoFullName: $ElementType<Scalars, 'String'>,
  commentContent: $ElementType<Scalars, 'String'>
        };

export type Query = {
          feed?: ?Array<?Entry>,
  entry?: ?Entry,
  currentUser?: ?User,
        };


export type QueryFeedArgs = {
          type: FeedType,
  offset?: ?$ElementType<Scalars, 'Int'>,
  limit?: ?$ElementType<Scalars, 'Int'>
        };


export type QueryEntryArgs = {
          repoFullName: $ElementType<Scalars, 'String'>
        };

export type Repository = {
          name: $ElementType<Scalars, 'String'>,
  full_name: $ElementType<Scalars, 'String'>,
  description?: ?$ElementType<Scalars, 'String'>,
  html_url: $ElementType<Scalars, 'String'>,
  stargazers_count: $ElementType<Scalars, 'Int'>,
  open_issues_count?: ?$ElementType<Scalars, 'Int'>,
  owner?: ?User,
        };

export type Subscription = {
          commentAdded?: ?Comment,
        };


export type SubscriptionCommentAddedArgs = {
          repoFullName: $ElementType<Scalars, 'String'>
        };

export type User = {
          login: $ElementType<Scalars, 'String'>,
  avatar_url: $ElementType<Scalars, 'String'>,
  html_url: $ElementType<Scalars, 'String'>,
        };

export type Vote = {
          vote_value: $ElementType<Scalars, 'Int'>,
        };

export const VoteTypeValues = Object.freeze({
          Up: 'UP', 
  Down: 'DOWN', 
  Cancel: 'CANCEL'
        });


export type VoteType = $Values<typeof VoteTypeValues>;
type $Pick<Origin: Object, Keys: Object> = $ObjMapi<Keys, <Key>(k: Key) => $ElementType<Origin, Key>>;

export type OnCommentAddedSubscriptionVariables = {
          repoFullName: $ElementType<Scalars, 'String'>
        };


export type OnCommentAddedSubscription = ({ __typename?: 'Subscription' } & { commentAdded: ?({ __typename?: 'Comment' } & $Pick<Comment, { id: *, createdAt: *, content: * }> & { postedBy: ({ __typename?: 'User' } & $Pick<User, { login: *, html_url: * }>) }) });

export type CommentQueryVariables = {
          repoFullName: $ElementType<Scalars, 'String'>,
  limit?: ?$ElementType<Scalars, 'Int'>,
  offset?: ?$ElementType<Scalars, 'Int'>
        };


export type CommentQuery = ({ __typename?: 'Query' } & { currentUser: ?({ __typename?: 'User' } & $Pick<User, { login: *, html_url: * }>), entry: ?({ __typename?: 'Entry' } & $Pick<Entry, { id: *, createdAt: *, commentCount: * }> & { postedBy: ({ __typename?: 'User' } & $Pick<User, { login: *, html_url: * }>), comments: Array<?({ __typename?: 'Comment' } & CommentsPageCommentFragment)>, repository: ({ __typename?: 'Repository' } & $Pick<Repository, { full_name: *, html_url: * }> & (({ __typename?: 'Repository' } & $Pick<Repository, { description: *, open_issues_count: *, stargazers_count: * }>))) }) });

export type CommentsPageCommentFragment = ({ __typename?: 'Comment' } & $Pick<Comment, { id: *, createdAt: *, content: * }> & { postedBy: ({ __typename?: 'User' } & $Pick<User, { login: *, html_url: * }>) });

export type CurrentUserForProfileQueryVariables = {};


export type CurrentUserForProfileQuery = ({ __typename?: 'Query' } & { currentUser: ?({ __typename?: 'User' } & $Pick<User, { login: *, avatar_url: * }>) });

export type FeedEntryFragment = ({ __typename?: 'Entry' } & $Pick<Entry, { id: *, commentCount: * }> & { repository: ({ __typename?: 'Repository' } & $Pick<Repository, { full_name: *, html_url: * }> & { owner: ?({ __typename?: 'User' } & $Pick<User, { avatar_url: * }>) }) } & (VoteButtonsFragment & RepoInfoFragment));

export type FeedQueryVariables = {
          type: FeedType,
  offset?: ?$ElementType<Scalars, 'Int'>,
  limit?: ?$ElementType<Scalars, 'Int'>
        };


export type FeedQuery = ({ __typename?: 'Query' } & { currentUser: ?({ __typename?: 'User' } & $Pick<User, { login: * }>), feed: ?Array<?({ __typename?: 'Entry' } & FeedEntryFragment)> });

export type SubmitRepositoryMutationVariables = {
          repoFullName: $ElementType<Scalars, 'String'>
        };


export type SubmitRepositoryMutation = ({ __typename?: 'Mutation' } & { submitRepository: ?({ __typename?: 'Entry' } & $Pick<Entry, { createdAt: * }>) });

export type RepoInfoFragment = ({ __typename?: 'Entry' } & $Pick<Entry, { createdAt: * }> & { repository: ({ __typename?: 'Repository' } & $Pick<Repository, { description: *, stargazers_count: *, open_issues_count: * }>), postedBy: ({ __typename?: 'User' } & $Pick<User, { html_url: *, login: * }>) });

export type SubmitCommentMutationVariables = {
          repoFullName: $ElementType<Scalars, 'String'>,
  commentContent: $ElementType<Scalars, 'String'>
        };


export type SubmitCommentMutation = ({ __typename?: 'Mutation' } & { submitComment: ?({ __typename?: 'Comment' } & CommentsPageCommentFragment) });

export type VoteButtonsFragment = ({ __typename?: 'Entry' } & $Pick<Entry, { score: * }> & { vote: ({ __typename?: 'Vote' } & $Pick<Vote, { vote_value: * }>) });

export type VoteMutationVariables = {
          repoFullName: $ElementType<Scalars, 'String'>,
  type: VoteType
        };


export type VoteMutation = ({ __typename?: 'Mutation' } & { vote: ?({ __typename?: 'Entry' } & $Pick<Entry, { score: *, id: * }> & { vote: ({ __typename?: 'Vote' } & $Pick<Vote, { vote_value: * }>) }) });
