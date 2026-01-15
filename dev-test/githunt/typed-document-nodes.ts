import { TypedDocumentNode as DocumentNode } from '@graphql-typed-document-node/core';
type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
export type Incremental<T> = T | { [P in keyof T]?: P extends ' $fragmentName' | '__typename' ? T[P] : never };
export type OnCommentAddedSubscriptionVariables = Exact<{
  repoFullName: string;
}>;

export type OnCommentAddedSubscription = {
  commentAdded: {
    id: number;
    createdAt: number;
    content: string;
    postedBy: { login: string; html_url: string };
  } | null;
};

export type CommentQueryVariables = Exact<{
  repoFullName: string;
  limit?: number | null | undefined;
  offset?: number | null | undefined;
}>;

export type CommentQuery = {
  currentUser: { login: string; html_url: string } | null;
  entry: {
    id: number;
    createdAt: number;
    commentCount: number;
    postedBy: { login: string; html_url: string };
    comments: Array<{
      id: number;
      createdAt: number;
      content: string;
      postedBy: { login: string; html_url: string };
    } | null>;
    repository: {
      description: string | null;
      open_issues_count: number | null;
      stargazers_count: number;
      full_name: string;
      html_url: string;
    };
  } | null;
};

export type CommentsPageCommentFragment = {
  id: number;
  createdAt: number;
  content: string;
  postedBy: { login: string; html_url: string };
};

export type CurrentUserForProfileQueryVariables = Exact<{ [key: string]: never }>;

export type CurrentUserForProfileQuery = { currentUser: { login: string; avatar_url: string } | null };

export type FeedEntryFragment = {
  id: number;
  commentCount: number;
  score: number;
  createdAt: number;
  repository: {
    full_name: string;
    html_url: string;
    description: string | null;
    stargazers_count: number;
    open_issues_count: number | null;
    owner: { avatar_url: string } | null;
  };
  vote: { vote_value: number };
  postedBy: { html_url: string; login: string };
};

export type FeedQueryVariables = Exact<{
  type: FeedType;
  offset?: number | null | undefined;
  limit?: number | null | undefined;
}>;

export type FeedQuery = {
  currentUser: { login: string } | null;
  feed: Array<{
    id: number;
    commentCount: number;
    score: number;
    createdAt: number;
    repository: {
      full_name: string;
      html_url: string;
      description: string | null;
      stargazers_count: number;
      open_issues_count: number | null;
      owner: { avatar_url: string } | null;
    };
    vote: { vote_value: number };
    postedBy: { html_url: string; login: string };
  } | null> | null;
};

export type SubmitRepositoryMutationVariables = Exact<{
  repoFullName: string;
}>;

export type SubmitRepositoryMutation = { submitRepository: { createdAt: number } | null };

export type RepoInfoFragment = {
  createdAt: number;
  repository: { description: string | null; stargazers_count: number; open_issues_count: number | null };
  postedBy: { html_url: string; login: string };
};

export type SubmitCommentMutationVariables = Exact<{
  repoFullName: string;
  commentContent: string;
}>;

export type SubmitCommentMutation = {
  submitComment: {
    id: number;
    createdAt: number;
    content: string;
    postedBy: { login: string; html_url: string };
  } | null;
};

export type VoteButtonsFragment = { score: number; vote: { vote_value: number } };

export type VoteMutationVariables = Exact<{
  repoFullName: string;
  type: VoteType;
}>;

export type VoteMutation = { vote: { score: number; id: number; vote: { vote_value: number } } | null };

export const CommentsPageCommentFragmentDoc = {
  kind: 'Document',
  definitions: [
    {
      kind: 'FragmentDefinition',
      name: { kind: 'Name', value: 'CommentsPageComment' },
      typeCondition: { kind: 'NamedType', name: { kind: 'Name', value: 'Comment' } },
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          { kind: 'Field', name: { kind: 'Name', value: 'id' } },
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'postedBy' },
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                { kind: 'Field', name: { kind: 'Name', value: 'login' } },
                { kind: 'Field', name: { kind: 'Name', value: 'html_url' } },
              ],
            },
          },
          { kind: 'Field', name: { kind: 'Name', value: 'createdAt' } },
          { kind: 'Field', name: { kind: 'Name', value: 'content' } },
        ],
      },
    },
  ],
} as unknown as DocumentNode<CommentsPageCommentFragment, unknown>;
export const VoteButtonsFragmentDoc = {
  kind: 'Document',
  definitions: [
    {
      kind: 'FragmentDefinition',
      name: { kind: 'Name', value: 'VoteButtons' },
      typeCondition: { kind: 'NamedType', name: { kind: 'Name', value: 'Entry' } },
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          { kind: 'Field', name: { kind: 'Name', value: 'score' } },
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'vote' },
            selectionSet: {
              kind: 'SelectionSet',
              selections: [{ kind: 'Field', name: { kind: 'Name', value: 'vote_value' } }],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<VoteButtonsFragment, unknown>;
export const RepoInfoFragmentDoc = {
  kind: 'Document',
  definitions: [
    {
      kind: 'FragmentDefinition',
      name: { kind: 'Name', value: 'RepoInfo' },
      typeCondition: { kind: 'NamedType', name: { kind: 'Name', value: 'Entry' } },
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          { kind: 'Field', name: { kind: 'Name', value: 'createdAt' } },
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'repository' },
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                { kind: 'Field', name: { kind: 'Name', value: 'description' } },
                { kind: 'Field', name: { kind: 'Name', value: 'stargazers_count' } },
                { kind: 'Field', name: { kind: 'Name', value: 'open_issues_count' } },
              ],
            },
          },
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'postedBy' },
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                { kind: 'Field', name: { kind: 'Name', value: 'html_url' } },
                { kind: 'Field', name: { kind: 'Name', value: 'login' } },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<RepoInfoFragment, unknown>;
export const FeedEntryFragmentDoc = {
  kind: 'Document',
  definitions: [
    {
      kind: 'FragmentDefinition',
      name: { kind: 'Name', value: 'FeedEntry' },
      typeCondition: { kind: 'NamedType', name: { kind: 'Name', value: 'Entry' } },
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          { kind: 'Field', name: { kind: 'Name', value: 'id' } },
          { kind: 'Field', name: { kind: 'Name', value: 'commentCount' } },
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'repository' },
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                { kind: 'Field', name: { kind: 'Name', value: 'full_name' } },
                { kind: 'Field', name: { kind: 'Name', value: 'html_url' } },
                {
                  kind: 'Field',
                  name: { kind: 'Name', value: 'owner' },
                  selectionSet: {
                    kind: 'SelectionSet',
                    selections: [{ kind: 'Field', name: { kind: 'Name', value: 'avatar_url' } }],
                  },
                },
              ],
            },
          },
          { kind: 'FragmentSpread', name: { kind: 'Name', value: 'VoteButtons' } },
          { kind: 'FragmentSpread', name: { kind: 'Name', value: 'RepoInfo' } },
        ],
      },
    },
    {
      kind: 'FragmentDefinition',
      name: { kind: 'Name', value: 'VoteButtons' },
      typeCondition: { kind: 'NamedType', name: { kind: 'Name', value: 'Entry' } },
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          { kind: 'Field', name: { kind: 'Name', value: 'score' } },
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'vote' },
            selectionSet: {
              kind: 'SelectionSet',
              selections: [{ kind: 'Field', name: { kind: 'Name', value: 'vote_value' } }],
            },
          },
        ],
      },
    },
    {
      kind: 'FragmentDefinition',
      name: { kind: 'Name', value: 'RepoInfo' },
      typeCondition: { kind: 'NamedType', name: { kind: 'Name', value: 'Entry' } },
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          { kind: 'Field', name: { kind: 'Name', value: 'createdAt' } },
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'repository' },
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                { kind: 'Field', name: { kind: 'Name', value: 'description' } },
                { kind: 'Field', name: { kind: 'Name', value: 'stargazers_count' } },
                { kind: 'Field', name: { kind: 'Name', value: 'open_issues_count' } },
              ],
            },
          },
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'postedBy' },
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                { kind: 'Field', name: { kind: 'Name', value: 'html_url' } },
                { kind: 'Field', name: { kind: 'Name', value: 'login' } },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<FeedEntryFragment, unknown>;
export const OnCommentAddedDocument = {
  kind: 'Document',
  definitions: [
    {
      kind: 'OperationDefinition',
      operation: 'subscription',
      name: { kind: 'Name', value: 'onCommentAdded' },
      variableDefinitions: [
        {
          kind: 'VariableDefinition',
          variable: { kind: 'Variable', name: { kind: 'Name', value: 'repoFullName' } },
          type: { kind: 'NonNullType', type: { kind: 'NamedType', name: { kind: 'Name', value: 'String' } } },
        },
      ],
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'commentAdded' },
            arguments: [
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'repoFullName' },
                value: { kind: 'Variable', name: { kind: 'Name', value: 'repoFullName' } },
              },
            ],
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                { kind: 'Field', name: { kind: 'Name', value: 'id' } },
                {
                  kind: 'Field',
                  name: { kind: 'Name', value: 'postedBy' },
                  selectionSet: {
                    kind: 'SelectionSet',
                    selections: [
                      { kind: 'Field', name: { kind: 'Name', value: 'login' } },
                      { kind: 'Field', name: { kind: 'Name', value: 'html_url' } },
                    ],
                  },
                },
                { kind: 'Field', name: { kind: 'Name', value: 'createdAt' } },
                { kind: 'Field', name: { kind: 'Name', value: 'content' } },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<OnCommentAddedSubscription, OnCommentAddedSubscriptionVariables>;
export const CommentDocument = {
  kind: 'Document',
  definitions: [
    {
      kind: 'OperationDefinition',
      operation: 'query',
      name: { kind: 'Name', value: 'Comment' },
      variableDefinitions: [
        {
          kind: 'VariableDefinition',
          variable: { kind: 'Variable', name: { kind: 'Name', value: 'repoFullName' } },
          type: { kind: 'NonNullType', type: { kind: 'NamedType', name: { kind: 'Name', value: 'String' } } },
        },
        {
          kind: 'VariableDefinition',
          variable: { kind: 'Variable', name: { kind: 'Name', value: 'limit' } },
          type: { kind: 'NamedType', name: { kind: 'Name', value: 'Int' } },
        },
        {
          kind: 'VariableDefinition',
          variable: { kind: 'Variable', name: { kind: 'Name', value: 'offset' } },
          type: { kind: 'NamedType', name: { kind: 'Name', value: 'Int' } },
        },
      ],
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'currentUser' },
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                { kind: 'Field', name: { kind: 'Name', value: 'login' } },
                { kind: 'Field', name: { kind: 'Name', value: 'html_url' } },
              ],
            },
          },
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'entry' },
            arguments: [
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'repoFullName' },
                value: { kind: 'Variable', name: { kind: 'Name', value: 'repoFullName' } },
              },
            ],
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                { kind: 'Field', name: { kind: 'Name', value: 'id' } },
                {
                  kind: 'Field',
                  name: { kind: 'Name', value: 'postedBy' },
                  selectionSet: {
                    kind: 'SelectionSet',
                    selections: [
                      { kind: 'Field', name: { kind: 'Name', value: 'login' } },
                      { kind: 'Field', name: { kind: 'Name', value: 'html_url' } },
                    ],
                  },
                },
                { kind: 'Field', name: { kind: 'Name', value: 'createdAt' } },
                {
                  kind: 'Field',
                  name: { kind: 'Name', value: 'comments' },
                  arguments: [
                    {
                      kind: 'Argument',
                      name: { kind: 'Name', value: 'limit' },
                      value: { kind: 'Variable', name: { kind: 'Name', value: 'limit' } },
                    },
                    {
                      kind: 'Argument',
                      name: { kind: 'Name', value: 'offset' },
                      value: { kind: 'Variable', name: { kind: 'Name', value: 'offset' } },
                    },
                  ],
                  selectionSet: {
                    kind: 'SelectionSet',
                    selections: [{ kind: 'FragmentSpread', name: { kind: 'Name', value: 'CommentsPageComment' } }],
                  },
                },
                { kind: 'Field', name: { kind: 'Name', value: 'commentCount' } },
                {
                  kind: 'Field',
                  name: { kind: 'Name', value: 'repository' },
                  selectionSet: {
                    kind: 'SelectionSet',
                    selections: [
                      { kind: 'Field', name: { kind: 'Name', value: 'full_name' } },
                      { kind: 'Field', name: { kind: 'Name', value: 'html_url' } },
                      {
                        kind: 'InlineFragment',
                        typeCondition: { kind: 'NamedType', name: { kind: 'Name', value: 'Repository' } },
                        selectionSet: {
                          kind: 'SelectionSet',
                          selections: [
                            { kind: 'Field', name: { kind: 'Name', value: 'description' } },
                            { kind: 'Field', name: { kind: 'Name', value: 'open_issues_count' } },
                            { kind: 'Field', name: { kind: 'Name', value: 'stargazers_count' } },
                          ],
                        },
                      },
                    ],
                  },
                },
              ],
            },
          },
        ],
      },
    },
    {
      kind: 'FragmentDefinition',
      name: { kind: 'Name', value: 'CommentsPageComment' },
      typeCondition: { kind: 'NamedType', name: { kind: 'Name', value: 'Comment' } },
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          { kind: 'Field', name: { kind: 'Name', value: 'id' } },
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'postedBy' },
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                { kind: 'Field', name: { kind: 'Name', value: 'login' } },
                { kind: 'Field', name: { kind: 'Name', value: 'html_url' } },
              ],
            },
          },
          { kind: 'Field', name: { kind: 'Name', value: 'createdAt' } },
          { kind: 'Field', name: { kind: 'Name', value: 'content' } },
        ],
      },
    },
  ],
} as unknown as DocumentNode<CommentQuery, CommentQueryVariables>;
export const CurrentUserForProfileDocument = {
  kind: 'Document',
  definitions: [
    {
      kind: 'OperationDefinition',
      operation: 'query',
      name: { kind: 'Name', value: 'CurrentUserForProfile' },
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'currentUser' },
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                { kind: 'Field', name: { kind: 'Name', value: 'login' } },
                { kind: 'Field', name: { kind: 'Name', value: 'avatar_url' } },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<CurrentUserForProfileQuery, CurrentUserForProfileQueryVariables>;
export const FeedDocument = {
  kind: 'Document',
  definitions: [
    {
      kind: 'OperationDefinition',
      operation: 'query',
      name: { kind: 'Name', value: 'Feed' },
      variableDefinitions: [
        {
          kind: 'VariableDefinition',
          variable: { kind: 'Variable', name: { kind: 'Name', value: 'type' } },
          type: { kind: 'NonNullType', type: { kind: 'NamedType', name: { kind: 'Name', value: 'FeedType' } } },
        },
        {
          kind: 'VariableDefinition',
          variable: { kind: 'Variable', name: { kind: 'Name', value: 'offset' } },
          type: { kind: 'NamedType', name: { kind: 'Name', value: 'Int' } },
        },
        {
          kind: 'VariableDefinition',
          variable: { kind: 'Variable', name: { kind: 'Name', value: 'limit' } },
          type: { kind: 'NamedType', name: { kind: 'Name', value: 'Int' } },
        },
      ],
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'currentUser' },
            selectionSet: {
              kind: 'SelectionSet',
              selections: [{ kind: 'Field', name: { kind: 'Name', value: 'login' } }],
            },
          },
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'feed' },
            arguments: [
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'type' },
                value: { kind: 'Variable', name: { kind: 'Name', value: 'type' } },
              },
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'offset' },
                value: { kind: 'Variable', name: { kind: 'Name', value: 'offset' } },
              },
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'limit' },
                value: { kind: 'Variable', name: { kind: 'Name', value: 'limit' } },
              },
            ],
            selectionSet: {
              kind: 'SelectionSet',
              selections: [{ kind: 'FragmentSpread', name: { kind: 'Name', value: 'FeedEntry' } }],
            },
          },
        ],
      },
    },
    {
      kind: 'FragmentDefinition',
      name: { kind: 'Name', value: 'VoteButtons' },
      typeCondition: { kind: 'NamedType', name: { kind: 'Name', value: 'Entry' } },
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          { kind: 'Field', name: { kind: 'Name', value: 'score' } },
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'vote' },
            selectionSet: {
              kind: 'SelectionSet',
              selections: [{ kind: 'Field', name: { kind: 'Name', value: 'vote_value' } }],
            },
          },
        ],
      },
    },
    {
      kind: 'FragmentDefinition',
      name: { kind: 'Name', value: 'RepoInfo' },
      typeCondition: { kind: 'NamedType', name: { kind: 'Name', value: 'Entry' } },
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          { kind: 'Field', name: { kind: 'Name', value: 'createdAt' } },
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'repository' },
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                { kind: 'Field', name: { kind: 'Name', value: 'description' } },
                { kind: 'Field', name: { kind: 'Name', value: 'stargazers_count' } },
                { kind: 'Field', name: { kind: 'Name', value: 'open_issues_count' } },
              ],
            },
          },
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'postedBy' },
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                { kind: 'Field', name: { kind: 'Name', value: 'html_url' } },
                { kind: 'Field', name: { kind: 'Name', value: 'login' } },
              ],
            },
          },
        ],
      },
    },
    {
      kind: 'FragmentDefinition',
      name: { kind: 'Name', value: 'FeedEntry' },
      typeCondition: { kind: 'NamedType', name: { kind: 'Name', value: 'Entry' } },
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          { kind: 'Field', name: { kind: 'Name', value: 'id' } },
          { kind: 'Field', name: { kind: 'Name', value: 'commentCount' } },
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'repository' },
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                { kind: 'Field', name: { kind: 'Name', value: 'full_name' } },
                { kind: 'Field', name: { kind: 'Name', value: 'html_url' } },
                {
                  kind: 'Field',
                  name: { kind: 'Name', value: 'owner' },
                  selectionSet: {
                    kind: 'SelectionSet',
                    selections: [{ kind: 'Field', name: { kind: 'Name', value: 'avatar_url' } }],
                  },
                },
              ],
            },
          },
          { kind: 'FragmentSpread', name: { kind: 'Name', value: 'VoteButtons' } },
          { kind: 'FragmentSpread', name: { kind: 'Name', value: 'RepoInfo' } },
        ],
      },
    },
  ],
} as unknown as DocumentNode<FeedQuery, FeedQueryVariables>;
export const SubmitRepositoryDocument = {
  kind: 'Document',
  definitions: [
    {
      kind: 'OperationDefinition',
      operation: 'mutation',
      name: { kind: 'Name', value: 'submitRepository' },
      variableDefinitions: [
        {
          kind: 'VariableDefinition',
          variable: { kind: 'Variable', name: { kind: 'Name', value: 'repoFullName' } },
          type: { kind: 'NonNullType', type: { kind: 'NamedType', name: { kind: 'Name', value: 'String' } } },
        },
      ],
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'submitRepository' },
            arguments: [
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'repoFullName' },
                value: { kind: 'Variable', name: { kind: 'Name', value: 'repoFullName' } },
              },
            ],
            selectionSet: {
              kind: 'SelectionSet',
              selections: [{ kind: 'Field', name: { kind: 'Name', value: 'createdAt' } }],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<SubmitRepositoryMutation, SubmitRepositoryMutationVariables>;
export const SubmitCommentDocument = {
  kind: 'Document',
  definitions: [
    {
      kind: 'OperationDefinition',
      operation: 'mutation',
      name: { kind: 'Name', value: 'submitComment' },
      variableDefinitions: [
        {
          kind: 'VariableDefinition',
          variable: { kind: 'Variable', name: { kind: 'Name', value: 'repoFullName' } },
          type: { kind: 'NonNullType', type: { kind: 'NamedType', name: { kind: 'Name', value: 'String' } } },
        },
        {
          kind: 'VariableDefinition',
          variable: { kind: 'Variable', name: { kind: 'Name', value: 'commentContent' } },
          type: { kind: 'NonNullType', type: { kind: 'NamedType', name: { kind: 'Name', value: 'String' } } },
        },
      ],
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'submitComment' },
            arguments: [
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'repoFullName' },
                value: { kind: 'Variable', name: { kind: 'Name', value: 'repoFullName' } },
              },
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'commentContent' },
                value: { kind: 'Variable', name: { kind: 'Name', value: 'commentContent' } },
              },
            ],
            selectionSet: {
              kind: 'SelectionSet',
              selections: [{ kind: 'FragmentSpread', name: { kind: 'Name', value: 'CommentsPageComment' } }],
            },
          },
        ],
      },
    },
    {
      kind: 'FragmentDefinition',
      name: { kind: 'Name', value: 'CommentsPageComment' },
      typeCondition: { kind: 'NamedType', name: { kind: 'Name', value: 'Comment' } },
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          { kind: 'Field', name: { kind: 'Name', value: 'id' } },
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'postedBy' },
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                { kind: 'Field', name: { kind: 'Name', value: 'login' } },
                { kind: 'Field', name: { kind: 'Name', value: 'html_url' } },
              ],
            },
          },
          { kind: 'Field', name: { kind: 'Name', value: 'createdAt' } },
          { kind: 'Field', name: { kind: 'Name', value: 'content' } },
        ],
      },
    },
  ],
} as unknown as DocumentNode<SubmitCommentMutation, SubmitCommentMutationVariables>;
export const VoteDocument = {
  kind: 'Document',
  definitions: [
    {
      kind: 'OperationDefinition',
      operation: 'mutation',
      name: { kind: 'Name', value: 'vote' },
      variableDefinitions: [
        {
          kind: 'VariableDefinition',
          variable: { kind: 'Variable', name: { kind: 'Name', value: 'repoFullName' } },
          type: { kind: 'NonNullType', type: { kind: 'NamedType', name: { kind: 'Name', value: 'String' } } },
        },
        {
          kind: 'VariableDefinition',
          variable: { kind: 'Variable', name: { kind: 'Name', value: 'type' } },
          type: { kind: 'NonNullType', type: { kind: 'NamedType', name: { kind: 'Name', value: 'VoteType' } } },
        },
      ],
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'vote' },
            arguments: [
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'repoFullName' },
                value: { kind: 'Variable', name: { kind: 'Name', value: 'repoFullName' } },
              },
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'type' },
                value: { kind: 'Variable', name: { kind: 'Name', value: 'type' } },
              },
            ],
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                { kind: 'Field', name: { kind: 'Name', value: 'score' } },
                { kind: 'Field', name: { kind: 'Name', value: 'id' } },
                {
                  kind: 'Field',
                  name: { kind: 'Name', value: 'vote' },
                  selectionSet: {
                    kind: 'SelectionSet',
                    selections: [{ kind: 'Field', name: { kind: 'Name', value: 'vote_value' } }],
                  },
                },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<VoteMutation, VoteMutationVariables>;
