import { makeFragmentData } from '../gql';
import { TweetsFragmentFragmentDoc } from '../gql/graphql';

const tweetsFragmentMockData = makeFragmentData(
  {
    Tweets: [
      {
        id: 'tweet_b',
        author: {
          id: 'user_b',
          username: 'bob',
        },
        body: 'Hi:)',
        Stats: {
          views: 200,
        },
      },
    ],
  },
  TweetsFragmentFragmentDoc
);
