export type Maybe<T> = T | null;

/** A list of options for the sort order of the feed */
export type FeedType = 'HOT' | 'NEW' | 'TOP';
/** The type of vote to record, when submitting a vote */
export type VoteType = 'UP' | 'DOWN' | 'CANCEL';


// ====================================================
// Documents
// ====================================================



export namespace OnCommentAdded {
  export type Variables = {
    repoFullName: string;
  };

  export type Subscription = {
    __typename?: 'Subscription';

    commentAdded: Maybe<CommentAdded>;
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
    limit?: Maybe<number>;
    offset?: Maybe<number>;
  };

  export type Query = {
    __typename?: 'Query';

    currentUser: Maybe<CurrentUser>;

    entry: Maybe<Entry>;
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

    comments: (Maybe<Comments>)[];

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
  }  & RepositoryInlineFragment;

  export type RepositoryInlineFragment = {
    __typename?: 'Repository';

    description: Maybe<string>;

    open_issues_count: Maybe<number>;

    stargazers_count: number;
  };
}

export namespace CurrentUserForProfile {
  export type Variables = {
  };

  export type Query = {
    __typename?: 'Query';

    currentUser: Maybe<CurrentUser>;
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
    offset?: Maybe<number>;
    limit?: Maybe<number>;
  };

  export type Query = {
    __typename?: 'Query';

    currentUser: Maybe<CurrentUser>;

    feed: Maybe<(Maybe<Feed>)[]>;
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

    submitRepository: Maybe<SubmitRepository>;
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

    submitComment: Maybe<SubmitComment>;
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

    vote: Maybe<Vote>;
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

    owner: Maybe<Owner>;
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

    description: Maybe<string>;

    stargazers_count: number;

    open_issues_count: Maybe<number>;
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

