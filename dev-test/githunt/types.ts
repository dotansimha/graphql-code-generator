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
    repoFullName: string;
  };

  export type Subscription = {
    __typename?: 'Subscription';

    commentAdded: CommentAdded | null;
  };

  export type CommentAdded = {
    __typename?: 'Comment';

    id: number;

    postedBy: PostedBy;

    createdAt: number;

    content: string;
  };

  export type PostedBy = {
    __typename?: 'User';

    login: string;

    html_url: string;
  };
}

export namespace Comment {
  export type Variables = {
    repoFullName: string;
    limit?: number | null;
    offset?: number | null;
  };

  export type Query = {
    __typename?: 'Query';

    currentUser: CurrentUser | null;

    entry: Entry | null;
  };

  export type CurrentUser = {
    __typename?: 'User';

    login: string;

    html_url: string;
  };

  export type Entry = {
    __typename?: 'Entry';

    id: number;

    postedBy: PostedBy;

    createdAt: number;

    comments: (Comments | null)[];

    commentCount: number;

    repository: Repository;
  };

  export type PostedBy = {
    __typename?: 'User';

    login: string;

    html_url: string;
  };

  export type Comments = CommentsPageComment.Fragment;

  export type Repository = {
    __typename?: RepositoryInlineFragment['__typename'];

    full_name: string;

    html_url: string;
  } & RepositoryInlineFragment;

  export type RepositoryInlineFragment = {
    __typename?: 'Repository';

    description: string | null;

    open_issues_count: number | null;

    stargazers_count: number;
  };
}

export namespace CurrentUserForProfile {
  export type Variables = {};

  export type Query = {
    __typename?: 'Query';

    currentUser: CurrentUser | null;
  };

  export type CurrentUser = {
    __typename?: 'User';

    login: string;

    avatar_url: string;
  };
}

export namespace Feed {
  export type Variables = {
    type: FeedType;
    offset?: number | null;
    limit?: number | null;
  };

  export type Query = {
    __typename?: 'Query';

    currentUser: CurrentUser | null;

    feed: (Feed | null)[] | null;
  };

  export type CurrentUser = {
    __typename?: 'User';

    login: string;
  };

  export type Feed = FeedEntry.Fragment;
}

export namespace SubmitRepository {
  export type Variables = {
    repoFullName: string;
  };

  export type Mutation = {
    __typename?: 'Mutation';

    submitRepository: SubmitRepository | null;
  };

  export type SubmitRepository = {
    __typename?: 'Entry';

    createdAt: number;
  };
}

export namespace SubmitComment {
  export type Variables = {
    repoFullName: string;
    commentContent: string;
  };

  export type Mutation = {
    __typename?: 'Mutation';

    submitComment: SubmitComment | null;
  };

  export type SubmitComment = CommentsPageComment.Fragment;
}

export namespace Vote {
  export type Variables = {
    repoFullName: string;
    type: VoteType;
  };

  export type Mutation = {
    __typename?: 'Mutation';

    vote: Vote | null;
  };

  export type Vote = {
    __typename?: 'Entry';

    score: number;

    id: number;

    vote: _Vote;
  };

  export type _Vote = {
    __typename?: 'Vote';

    vote_value: number;
  };
}

export namespace CommentsPageComment {
  export type Fragment = {
    __typename?: 'Comment';

    id: number;

    postedBy: PostedBy;

    createdAt: number;

    content: string;
  };

  export type PostedBy = {
    __typename?: 'User';

    login: string;

    html_url: string;
  };
}

export namespace FeedEntry {
  export type Fragment = {
    __typename?: 'Entry';

    id: number;

    commentCount: number;

    repository: Repository;
  } & (VoteButtons.Fragment & RepoInfo.Fragment);

  export type Repository = {
    __typename?: 'Repository';

    full_name: string;

    html_url: string;

    owner: Owner | null;
  };

  export type Owner = {
    __typename?: 'User';

    avatar_url: string;
  };
}

export namespace RepoInfo {
  export type Fragment = {
    __typename?: 'Entry';

    createdAt: number;

    repository: Repository;

    postedBy: PostedBy;
  };

  export type Repository = {
    __typename?: 'Repository';

    description: string | null;

    stargazers_count: number;

    open_issues_count: number | null;
  };

  export type PostedBy = {
    __typename?: 'User';

    html_url: string;

    login: string;
  };
}

export namespace VoteButtons {
  export type Fragment = {
    __typename?: 'Entry';

    score: number;

    vote: Vote;
  };

  export type Vote = {
    __typename?: 'Vote';

    vote_value: number;
  };
}
