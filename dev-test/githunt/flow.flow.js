// @flow

export type Query = {
  feed: ?Array<?Entry>,
  entry: ?Entry,
  currentUser: ?User,
};

export const FeedTypeValues = {
  HOT: 'HOT', 
  NEW: 'NEW', 
  TOP: 'TOP'
};
export type FeedType = $Values<typeof FeedTypeValues>;

export type Entry = {
  repository: Repository,
  postedBy: User,
  createdAt: number,
  score: number,
  hotScore: number,
  comments: Array<?Comment>,
  commentCount: number,
  id: number,
  vote: Vote,
};

export type Repository = {
  name: string,
  full_name: string,
  description: ?string,
  html_url: string,
  stargazers_count: number,
  open_issues_count: ?number,
  owner: ?User,
};

export type User = {
  login: string,
  avatar_url: string,
  html_url: string,
};

export type Comment = {
  id: number,
  postedBy: User,
  createdAt: number,
  content: string,
  repoName: string,
};

export type Vote = {
  vote_value: number,
};

export type Mutation = {
  submitRepository: ?Entry,
  vote: ?Entry,
  submitComment: ?Comment,
};

export const VoteTypeValues = {
  UP: 'UP', 
  DOWN: 'DOWN', 
  CANCEL: 'CANCEL'
};
export type VoteType = $Values<typeof VoteTypeValues>;

export type Subscription = {
  commentAdded: ?Comment,
};
type $Pick<Origin: Object, Keys: Object> = $ObjMapi<Keys, <Key>(k: Key) => $ElementType<Origin, Key>>;

export type OnCommentAddedSubscription = ({ commentAdded: ($Pick<Comment, { id: *, createdAt: *, content: * }> & { postedBy: ($Pick<User, { login: *, html_url: * }>) }) });

export type CommentQuery = ({ currentUser: ($Pick<User, { login: *, html_url: * }>), entry: ($Pick<Entry, { id: *, createdAt: *, commentCount: * }> & { postedBy: ($Pick<User, { login: *, html_url: * }>), comments: (), repository: ($Pick<Repository, { full_name: *, html_url: * }>) }) });


export type CurrentUserForProfileQuery = ({ currentUser: ($Pick<User, { login: *, avatar_url: * }>) });


export type FeedQuery = ({ currentUser: ($Pick<User, { login: * }>), feed: () });

export type SubmitRepositoryMutation = ({ submitRepository: ($Pick<Entry, { createdAt: * }>) });


export type SubmitCommentMutation = ({ submitComment: () });


export type VoteMutation = ({ vote: ($Pick<Entry, { score: *, id: * }> & { vote: ($Pick<Vote, { vote_value: * }>) }) });
