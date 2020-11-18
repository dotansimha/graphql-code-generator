import { gql } from 'apollo-angular';
import { Injectable } from '@angular/core';
import * as Apollo from 'apollo-angular';
import * as ApolloCore from '@apollo/client/core';
export type Maybe<T> = T | null;
export type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]?: Maybe<T[SubKey]> };
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]: Maybe<T[SubKey]> };
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: string;
  String: string;
  Boolean: boolean;
  Int: number;
  Float: number;
};

export type Query = {
  __typename?: 'Query';
  /** A feed of repository submissions */
  feed?: Maybe<Array<Maybe<Entry>>>;
  /** A single entry */
  entry?: Maybe<Entry>;
  /** Return the currently logged in user, or null if nobody is logged in */
  currentUser?: Maybe<User>;
};

export type QueryFeedArgs = {
  type: FeedType;
  offset?: Maybe<Scalars['Int']>;
  limit?: Maybe<Scalars['Int']>;
};

export type QueryEntryArgs = {
  repoFullName: Scalars['String'];
};

/** A list of options for the sort order of the feed */
export enum FeedType {
  /** Sort by a combination of freshness and score, using Reddit's algorithm */
  Hot = 'HOT',
  /** Newest entries first */
  New = 'NEW',
  /** Highest score entries first */
  Top = 'TOP',
}

/** Information about a GitHub repository submitted to GitHunt */
export type Entry = {
  __typename?: 'Entry';
  /** Information about the repository from GitHub */
  repository: Repository;
  /** The GitHub user who submitted this entry */
  postedBy: User;
  /** A timestamp of when the entry was submitted */
  createdAt: Scalars['Float'];
  /** The score of this repository, upvotes - downvotes */
  score: Scalars['Int'];
  /** The hot score of this repository */
  hotScore: Scalars['Float'];
  /** Comments posted about this repository */
  comments: Array<Maybe<Comment>>;
  /** The number of comments posted about this repository */
  commentCount: Scalars['Int'];
  /** The SQL ID of this entry */
  id: Scalars['Int'];
  /** XXX to be changed */
  vote: Vote;
};

/** Information about a GitHub repository submitted to GitHunt */
export type EntryCommentsArgs = {
  limit?: Maybe<Scalars['Int']>;
  offset?: Maybe<Scalars['Int']>;
};

/**
 * A repository object from the GitHub API. This uses the exact field names returned by the
 * GitHub API for simplicity, even though the convention for GraphQL is usually to camel case.
 */
export type Repository = {
  __typename?: 'Repository';
  /** Just the name of the repository, e.g. GitHunt-API */
  name: Scalars['String'];
  /** The full name of the repository with the username, e.g. apollostack/GitHunt-API */
  full_name: Scalars['String'];
  /** The description of the repository */
  description?: Maybe<Scalars['String']>;
  /** The link to the repository on GitHub */
  html_url: Scalars['String'];
  /** The number of people who have starred this repository on GitHub */
  stargazers_count: Scalars['Int'];
  /** The number of open issues on this repository on GitHub */
  open_issues_count?: Maybe<Scalars['Int']>;
  /** The owner of this repository on GitHub, e.g. apollostack */
  owner?: Maybe<User>;
};

/** A user object from the GitHub API. This uses the exact field names returned from the GitHub API. */
export type User = {
  __typename?: 'User';
  /** The name of the user, e.g. apollostack */
  login: Scalars['String'];
  /** The URL to a directly embeddable image for this user's avatar */
  avatar_url: Scalars['String'];
  /** The URL of this user's GitHub page */
  html_url: Scalars['String'];
};

/** A comment about an entry, submitted by a user */
export type Comment = {
  __typename?: 'Comment';
  /** The SQL ID of this entry */
  id: Scalars['Int'];
  /** The GitHub user who posted the comment */
  postedBy: User;
  /** A timestamp of when the comment was posted */
  createdAt: Scalars['Float'];
  /** The text of the comment */
  content: Scalars['String'];
  /** The repository which this comment is about */
  repoName: Scalars['String'];
};

/** XXX to be removed */
export type Vote = {
  __typename?: 'Vote';
  vote_value: Scalars['Int'];
};

export type Mutation = {
  __typename?: 'Mutation';
  /** Submit a new repository, returns the new submission */
  submitRepository?: Maybe<Entry>;
  /** Vote on a repository submission, returns the submission that was voted on */
  vote?: Maybe<Entry>;
  /** Comment on a repository, returns the new comment */
  submitComment?: Maybe<Comment>;
};

export type MutationSubmitRepositoryArgs = {
  repoFullName: Scalars['String'];
};

export type MutationVoteArgs = {
  repoFullName: Scalars['String'];
  type: VoteType;
};

export type MutationSubmitCommentArgs = {
  repoFullName: Scalars['String'];
  commentContent: Scalars['String'];
};

/** The type of vote to record, when submitting a vote */
export enum VoteType {
  Up = 'UP',
  Down = 'DOWN',
  Cancel = 'CANCEL',
}

export type Subscription = {
  __typename?: 'Subscription';
  /** Subscription fires on every comment added */
  commentAdded?: Maybe<Comment>;
};

export type SubscriptionCommentAddedArgs = {
  repoFullName: Scalars['String'];
};

export type OnCommentAddedSubscriptionVariables = Exact<{
  repoFullName: Scalars['String'];
}>;

export type OnCommentAddedSubscription = { __typename?: 'Subscription' } & {
  commentAdded?: Maybe<
    { __typename?: 'Comment' } & Pick<Comment, 'id' | 'createdAt' | 'content'> & {
        postedBy: { __typename?: 'User' } & Pick<User, 'login' | 'html_url'>;
      }
  >;
};

export type CommentQueryVariables = Exact<{
  repoFullName: Scalars['String'];
  limit?: Maybe<Scalars['Int']>;
  offset?: Maybe<Scalars['Int']>;
}>;

export type CommentQuery = { __typename?: 'Query' } & {
  currentUser?: Maybe<{ __typename?: 'User' } & Pick<User, 'login' | 'html_url'>>;
  entry?: Maybe<
    { __typename?: 'Entry' } & Pick<Entry, 'id' | 'createdAt' | 'commentCount'> & {
        postedBy: { __typename?: 'User' } & Pick<User, 'login' | 'html_url'>;
        comments: Array<Maybe<{ __typename?: 'Comment' } & CommentsPageCommentFragment>>;
        repository: { __typename?: 'Repository' } & Pick<
          Repository,
          'description' | 'open_issues_count' | 'stargazers_count' | 'full_name' | 'html_url'
        >;
      }
  >;
};

export type CommentsPageCommentFragment = { __typename?: 'Comment' } & Pick<Comment, 'id' | 'createdAt' | 'content'> & {
    postedBy: { __typename?: 'User' } & Pick<User, 'login' | 'html_url'>;
  };

export type CurrentUserForProfileQueryVariables = Exact<{ [key: string]: never }>;

export type CurrentUserForProfileQuery = { __typename?: 'Query' } & {
  currentUser?: Maybe<{ __typename?: 'User' } & Pick<User, 'login' | 'avatar_url'>>;
};

export type FeedEntryFragment = { __typename?: 'Entry' } & Pick<Entry, 'id' | 'commentCount'> & {
    repository: { __typename?: 'Repository' } & Pick<Repository, 'full_name' | 'html_url'> & {
        owner?: Maybe<{ __typename?: 'User' } & Pick<User, 'avatar_url'>>;
      };
  } & VoteButtonsFragment &
  RepoInfoFragment;

export type FeedQueryVariables = Exact<{
  type: FeedType;
  offset?: Maybe<Scalars['Int']>;
  limit?: Maybe<Scalars['Int']>;
}>;

export type FeedQuery = { __typename?: 'Query' } & {
  currentUser?: Maybe<{ __typename?: 'User' } & Pick<User, 'login'>>;
  feed?: Maybe<Array<Maybe<{ __typename?: 'Entry' } & FeedEntryFragment>>>;
};

export type SubmitRepositoryMutationVariables = Exact<{
  repoFullName: Scalars['String'];
}>;

export type SubmitRepositoryMutation = { __typename?: 'Mutation' } & {
  submitRepository?: Maybe<{ __typename?: 'Entry' } & Pick<Entry, 'createdAt'>>;
};

export type RepoInfoFragment = { __typename?: 'Entry' } & Pick<Entry, 'createdAt'> & {
    repository: { __typename?: 'Repository' } & Pick<
      Repository,
      'description' | 'stargazers_count' | 'open_issues_count'
    >;
    postedBy: { __typename?: 'User' } & Pick<User, 'html_url' | 'login'>;
  };

export type SubmitCommentMutationVariables = Exact<{
  repoFullName: Scalars['String'];
  commentContent: Scalars['String'];
}>;

export type SubmitCommentMutation = { __typename?: 'Mutation' } & {
  submitComment?: Maybe<{ __typename?: 'Comment' } & CommentsPageCommentFragment>;
};

export type VoteButtonsFragment = { __typename?: 'Entry' } & Pick<Entry, 'score'> & {
    vote: { __typename?: 'Vote' } & Pick<Vote, 'vote_value'>;
  };

export type VoteMutationVariables = Exact<{
  repoFullName: Scalars['String'];
  type: VoteType;
}>;

export type VoteMutation = { __typename?: 'Mutation' } & {
  vote?: Maybe<
    { __typename?: 'Entry' } & Pick<Entry, 'score' | 'id'> & {
        vote: { __typename?: 'Vote' } & Pick<Vote, 'vote_value'>;
      }
  >;
};

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
  ${RepoInfoFragmentDoc}
`;
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

@Injectable({
  providedIn: 'root',
})
export class OnCommentAddedGQL extends Apollo.Subscription<
  OnCommentAddedSubscription,
  OnCommentAddedSubscriptionVariables
> {
  document = OnCommentAddedDocument;

  constructor(apollo: Apollo.Apollo) {
    super(apollo);
  }
}
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
  ${CommentsPageCommentFragmentDoc}
`;

@Injectable({
  providedIn: 'root',
})
export class CommentGQL extends Apollo.Query<CommentQuery, CommentQueryVariables> {
  document = CommentDocument;

  constructor(apollo: Apollo.Apollo) {
    super(apollo);
  }
}
export const CurrentUserForProfileDocument = gql`
  query CurrentUserForProfile {
    currentUser {
      login
      avatar_url
    }
  }
`;

@Injectable({
  providedIn: 'root',
})
export class CurrentUserForProfileGQL extends Apollo.Query<
  CurrentUserForProfileQuery,
  CurrentUserForProfileQueryVariables
> {
  document = CurrentUserForProfileDocument;

  constructor(apollo: Apollo.Apollo) {
    super(apollo);
  }
}
export const FeedDocument = gql`
  query Feed($type: FeedType!, $offset: Int, $limit: Int) {
    currentUser {
      login
    }
    feed(type: $type, offset: $offset, limit: $limit) {
      ...FeedEntry
    }
  }
  ${FeedEntryFragmentDoc}
`;

@Injectable({
  providedIn: 'root',
})
export class FeedGQL extends Apollo.Query<FeedQuery, FeedQueryVariables> {
  document = FeedDocument;

  constructor(apollo: Apollo.Apollo) {
    super(apollo);
  }
}
export const SubmitRepositoryDocument = gql`
  mutation submitRepository($repoFullName: String!) {
    submitRepository(repoFullName: $repoFullName) {
      createdAt
    }
  }
`;

@Injectable({
  providedIn: 'root',
})
export class SubmitRepositoryGQL extends Apollo.Mutation<SubmitRepositoryMutation, SubmitRepositoryMutationVariables> {
  document = SubmitRepositoryDocument;

  constructor(apollo: Apollo.Apollo) {
    super(apollo);
  }
}
export const SubmitCommentDocument = gql`
  mutation submitComment($repoFullName: String!, $commentContent: String!) {
    submitComment(repoFullName: $repoFullName, commentContent: $commentContent) {
      ...CommentsPageComment
    }
  }
  ${CommentsPageCommentFragmentDoc}
`;

@Injectable({
  providedIn: 'root',
})
export class SubmitCommentGQL extends Apollo.Mutation<SubmitCommentMutation, SubmitCommentMutationVariables> {
  document = SubmitCommentDocument;

  constructor(apollo: Apollo.Apollo) {
    super(apollo);
  }
}
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

@Injectable({
  providedIn: 'root',
})
export class VoteGQL extends Apollo.Mutation<VoteMutation, VoteMutationVariables> {
  document = VoteDocument;

  constructor(apollo: Apollo.Apollo) {
    super(apollo);
  }
}

type Omit<T, K extends keyof T> = Pick<T, Exclude<keyof T, K>>;

interface WatchQueryOptionsAlone<V> extends Omit<ApolloCore.WatchQueryOptions<V>, 'query' | 'variables'> {}

interface QueryOptionsAlone<V> extends Omit<ApolloCore.QueryOptions<V>, 'query' | 'variables'> {}

interface MutationOptionsAlone<T, V> extends Omit<ApolloCore.MutationOptions<T, V>, 'mutation' | 'variables'> {}

interface SubscriptionOptionsAlone<V> extends Omit<ApolloCore.SubscriptionOptions<V>, 'query' | 'variables'> {}

@Injectable({ providedIn: 'root' })
export class ApolloAngularSDK {
  constructor(
    private onCommentAddedGql: OnCommentAddedGQL,
    private commentGql: CommentGQL,
    private currentUserForProfileGql: CurrentUserForProfileGQL,
    private feedGql: FeedGQL,
    private submitRepositoryGql: SubmitRepositoryGQL,
    private submitCommentGql: SubmitCommentGQL,
    private voteGql: VoteGQL
  ) {}

  onCommentAdded(
    variables: OnCommentAddedSubscriptionVariables,
    options?: SubscriptionOptionsAlone<OnCommentAddedSubscriptionVariables>
  ) {
    return this.onCommentAddedGql.subscribe(variables, options);
  }

  comment(variables: CommentQueryVariables, options?: QueryOptionsAlone<CommentQueryVariables>) {
    return this.commentGql.fetch(variables, options);
  }

  commentWatch(variables: CommentQueryVariables, options?: WatchQueryOptionsAlone<CommentQueryVariables>) {
    return this.commentGql.watch(variables, options);
  }

  currentUserForProfile(
    variables?: CurrentUserForProfileQueryVariables,
    options?: QueryOptionsAlone<CurrentUserForProfileQueryVariables>
  ) {
    return this.currentUserForProfileGql.fetch(variables, options);
  }

  currentUserForProfileWatch(
    variables?: CurrentUserForProfileQueryVariables,
    options?: WatchQueryOptionsAlone<CurrentUserForProfileQueryVariables>
  ) {
    return this.currentUserForProfileGql.watch(variables, options);
  }

  feed(variables: FeedQueryVariables, options?: QueryOptionsAlone<FeedQueryVariables>) {
    return this.feedGql.fetch(variables, options);
  }

  feedWatch(variables: FeedQueryVariables, options?: WatchQueryOptionsAlone<FeedQueryVariables>) {
    return this.feedGql.watch(variables, options);
  }

  submitRepository(
    variables: SubmitRepositoryMutationVariables,
    options?: MutationOptionsAlone<SubmitRepositoryMutation, SubmitRepositoryMutationVariables>
  ) {
    return this.submitRepositoryGql.mutate(variables, options);
  }

  submitComment(
    variables: SubmitCommentMutationVariables,
    options?: MutationOptionsAlone<SubmitCommentMutation, SubmitCommentMutationVariables>
  ) {
    return this.submitCommentGql.mutate(variables, options);
  }

  vote(variables: VoteMutationVariables, options?: MutationOptionsAlone<VoteMutation, VoteMutationVariables>) {
    return this.voteGql.mutate(variables, options);
  }
}
