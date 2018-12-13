export type Maybe<T> = T | null;

/** A list of options for the sort order of the feed */
export enum FeedType {
  Hot = 'HOT',
  New = 'NEW',
  Top = 'TOP'
}
/** The type of vote to record, when submitting a vote */
export enum VoteType {
  Up = 'UP',
  Down = 'DOWN',
  Cancel = 'CANCEL'
}

// ====================================================
// Documents
// ====================================================

export namespace OnCommentAdded {
  export type Variables = {
    readonly repoFullName: string;
  };

  export type Subscription = {
    readonly __typename?: 'Subscription';

    readonly commentAdded: Maybe<CommentAdded>;
  };

  export type CommentAdded = {
    readonly __typename?: 'Comment';

    readonly id: number;

    readonly postedBy: PostedBy;

    readonly createdAt: number;

    readonly content: string;
  };

  export type PostedBy = {
    readonly __typename?: 'User';

    readonly login: string;

    readonly html_url: string;
  };
}

export namespace Comment {
  export type Variables = {
    readonly repoFullName: string;
    readonly limit?: Maybe<number>;
    readonly offset?: Maybe<number>;
  };

  export type Query = {
    readonly __typename?: 'Query';

    readonly currentUser: Maybe<CurrentUser>;

    readonly entry: Maybe<Entry>;
  };

  export type CurrentUser = {
    readonly __typename?: 'User';

    readonly login: string;

    readonly html_url: string;
  };

  export type Entry = {
    readonly __typename?: 'Entry';

    readonly id: number;

    readonly postedBy: PostedBy;

    readonly createdAt: number;

    readonly comments: ReadonlyArray<Maybe<Comments>>;

    readonly commentCount: number;

    readonly repository: Repository;
  };

  export type PostedBy = {
    readonly __typename?: 'User';

    readonly login: string;

    readonly html_url: string;
  };

  export type Comments = CommentsPageComment.Fragment;

  export type Repository = {
    readonly __typename?: RepositoryInlineFragment['__typename'];

    readonly full_name: string;

    readonly html_url: string;
  } & RepositoryInlineFragment;

  export type RepositoryInlineFragment = {
    readonly __typename?: 'Repository';

    readonly description: Maybe<string>;

    readonly open_issues_count: Maybe<number>;

    readonly stargazers_count: number;
  };
}

export namespace CurrentUserForProfile {
  export type Variables = {};

  export type Query = {
    readonly __typename?: 'Query';

    readonly currentUser: Maybe<CurrentUser>;
  };

  export type CurrentUser = {
    readonly __typename?: 'User';

    readonly login: string;

    readonly avatar_url: string;
  };
}

export namespace Feed {
  export type Variables = {
    readonly type: FeedType;
    readonly offset?: Maybe<number>;
    readonly limit?: Maybe<number>;
  };

  export type Query = {
    readonly __typename?: 'Query';

    readonly currentUser: Maybe<CurrentUser>;

    readonly feed: Maybe<ReadonlyArray<Maybe<Feed>>>;
  };

  export type CurrentUser = {
    readonly __typename?: 'User';

    readonly login: string;
  };

  export type Feed = FeedEntry.Fragment;
}

export namespace SubmitRepository {
  export type Variables = {
    readonly repoFullName: string;
  };

  export type Mutation = {
    readonly __typename?: 'Mutation';

    readonly submitRepository: Maybe<SubmitRepository>;
  };

  export type SubmitRepository = {
    readonly __typename?: 'Entry';

    readonly createdAt: number;
  };
}

export namespace SubmitComment {
  export type Variables = {
    readonly repoFullName: string;
    readonly commentContent: string;
  };

  export type Mutation = {
    readonly __typename?: 'Mutation';

    readonly submitComment: Maybe<SubmitComment>;
  };

  export type SubmitComment = CommentsPageComment.Fragment;
}

export namespace Vote {
  export type Variables = {
    readonly repoFullName: string;
    readonly type: VoteType;
  };

  export type Mutation = {
    readonly __typename?: 'Mutation';

    readonly vote: Maybe<Vote>;
  };

  export type Vote = {
    readonly __typename?: 'Entry';

    readonly score: number;

    readonly id: number;

    readonly vote: _Vote;
  };

  export type _Vote = {
    readonly __typename?: 'Vote';

    readonly vote_value: number;
  };
}

export namespace CommentsPageComment {
  export type Fragment = {
    readonly __typename?: 'Comment';

    readonly id: number;

    readonly postedBy: PostedBy;

    readonly createdAt: number;

    readonly content: string;
  };

  export type PostedBy = {
    readonly __typename?: 'User';

    readonly login: string;

    readonly html_url: string;
  };
}

export namespace FeedEntry {
  export type Fragment = {
    readonly __typename?: 'Entry';

    readonly id: number;

    readonly commentCount: number;

    readonly repository: Repository;
  } & (VoteButtons.Fragment & RepoInfo.Fragment);

  export type Repository = {
    readonly __typename?: 'Repository';

    readonly full_name: string;

    readonly html_url: string;

    readonly owner: Maybe<Owner>;
  };

  export type Owner = {
    readonly __typename?: 'User';

    readonly avatar_url: string;
  };
}

export namespace RepoInfo {
  export type Fragment = {
    readonly __typename?: 'Entry';

    readonly createdAt: number;

    readonly repository: Repository;

    readonly postedBy: PostedBy;
  };

  export type Repository = {
    readonly __typename?: 'Repository';

    readonly description: Maybe<string>;

    readonly stargazers_count: number;

    readonly open_issues_count: Maybe<number>;
  };

  export type PostedBy = {
    readonly __typename?: 'User';

    readonly html_url: string;

    readonly login: string;
  };
}

export namespace VoteButtons {
  export type Fragment = {
    readonly __typename?: 'Entry';

    readonly score: number;

    readonly vote: Vote;
  };

  export type Vote = {
    readonly __typename?: 'Vote';

    readonly vote_value: number;
  };
}
