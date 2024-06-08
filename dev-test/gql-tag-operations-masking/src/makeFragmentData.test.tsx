import { FragmentType, UnmaskFragment, graphql, makeFragmentData } from '../gql';

const UserFragment = graphql(`
  fragment UserFragment on User {
    id
    username
  }
`);

const TweetWithUserFragment = graphql(`
  fragment TweetWithUserFragment on Tweet {
    id
    body
    author {
      ...UserFragment
    }
  }
`);

graphql(`
  fragment UserWithNameFragment on User {
    id
    username
    first_name
    last_name
  }
`);

const TweetWithUserNameFragment = graphql(`
  fragment TweetWithUserNameFragment on Tweet {
    id
    body
    author {
      ...UserFragment
      ...UserWithNameFragment
    }
  }
`);

const UserWithNestedFollowersAndTweetsFragment = graphql(`
  fragment UserWithNestedFollowersAndTweetsFragment on User {
    id
    ...UserFragment
    ...UserWithNameFragment
    full_name
    Followers {
      id
      ...UserFragment
      Followers {
        id
        ...UserFragment
      }
      Tweets {
        ...TweetWithUserFragment
      }
    }
    Tweets {
      id
      ...TweetWithUserFragment
      author {
        id
        Followers {
          id
          ...UserFragment
        }
      }
    }
  }
`);

const QueryOfNotificationsFragment = graphql(`
  fragment QueryOfNotificationsFragment on Query {
    Notifications {
      id

      ... on Message {
        body
        from {
          id
        }
      }
      ... on Information {
        body
        priority
      }
    }
  }
`);

describe('the first argument of makeFragmentData should not be masked', () => {
  it('in case with a simple fragment', () => {
    const mockData: UnmaskFragment<FragmentType<typeof UserFragment>> = {
      id: 'user_001',
      username: 'alice',
    };

    expect(makeFragmentData(mockData, UserFragment)).toBe(mockData);
  });

  it('in case with a fragment which includes another fragment', () => {
    const mockData: UnmaskFragment<FragmentType<typeof TweetWithUserFragment>> = {
      id: 'user_001',
      author: {
        id: 'user_001',
        username: 'alice',
      },
      body: 'Hello',
    };

    expect(makeFragmentData(mockData, TweetWithUserFragment)).toBe(mockData);
  });

  it('in case with a fragment which includes multiple fragment', () => {
    const mockData: UnmaskFragment<FragmentType<typeof TweetWithUserNameFragment>> = {
      id: 'user_001',
      author: {
        id: 'user_001',
        username: 'alice',
        first_name: 'alicia',
      },
      body: 'Hello',
    };

    expect(makeFragmentData(mockData, TweetWithUserNameFragment)).toBe(mockData);
  });

  it('in case with a deeply nested fragment', () => {
    const mockData: UnmaskFragment<FragmentType<typeof UserWithNestedFollowersAndTweetsFragment>> = {
      id: 'user_002',
      username: 'bob',
      first_name: 'bob',
      full_name: 'bob bob',
      Followers: [
        {
          id: 'user_001',
          username: 'alice',
          Followers: [{ id: 'user_002', username: 'bob' }],
          Tweets: [
            {
              id: 'tweet_001',
              author: { id: 'user_001', username: 'alice' },
              body: 'Hello',
            },
          ],
        },
      ],
      Tweets: [
        {
          id: 'tweet_002',
          body: 'Hi:)',
          author: {
            id: 'user_002',
            username: 'bob',
            Followers: [{ id: 'user_001', username: 'alice' }],
          },
        },
      ],
    };

    expect(makeFragmentData(mockData, UserWithNestedFollowersAndTweetsFragment)).toBe(mockData);
  });

  it('in case with a fragment includes an interface', () => {
    const mockData: UnmaskFragment<FragmentType<typeof QueryOfNotificationsFragment>> = {
      Notifications: [
        {
          id: 'information_001',
          body: 'a new notification!',
          priority: 2,
        },
        {
          id: 'message_001',
          body: 'a new message!',
          from: {
            id: 'user_003',
          },
        },
      ],
    };

    expect(makeFragmentData(mockData, QueryOfNotificationsFragment)).toBe(mockData);
  });
});
