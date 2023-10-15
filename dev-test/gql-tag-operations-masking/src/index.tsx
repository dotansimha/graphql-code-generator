/* eslint-disable @typescript-eslint/no-unused-vars */
import React from 'react';
import { graphql, FragmentType, useFragment } from '../gql';
import { useQuery } from 'urql';

const TweetFragment = graphql(/* GraphQL */ `
  fragment TweetFragment on Tweet {
    id
    body
    ...TweetAuthorFragment
  }
`);

const TweetStatsFragment = graphql(/* GraphQL */ `
  fragment TweetStatsFragment on Tweet {
    id
    Stats {
      views
    }
  }
`);

const TweetAuthorFragment = graphql(/* GraphQL */ `
  fragment TweetAuthorFragment on Tweet {
    id
    author {
      id
      username
    }
  }
`);

const TweetsFragment = graphql(/* GraphQL */ `
  fragment TweetsFragment on Query {
    Tweets {
      id
      ...TweetFragment
      ...TweetStatsFragment
    }
  }
`);

const TweetAppQuery = graphql(/* GraphQL */ `
  query TweetAppQuery {
    ...TweetsFragment
  }
`);

const Tweet = (props: { tweet: FragmentType<typeof TweetFragment> }) => {
  const tweet = useFragment(TweetFragment, props.tweet);

  return (
    <li>
      <TweetAuthor tweet={tweet} />
      {tweet.id} {tweet.body}
    </li>
  );
};

const TweetStats = (props: { tweet: FragmentType<typeof TweetStatsFragment> }) => {
  const tweet = useFragment(TweetStatsFragment, props.tweet);

  return <div>{tweet.Stats?.views} views</div>;
};

const TweetAuthor = (props: { tweet: FragmentType<typeof TweetAuthorFragment> }) => {
  const tweet = useFragment(TweetAuthorFragment, props.tweet);

  return <div>{tweet.author?.username}</div>;
};

const Tweets = (props: { tweets: FragmentType<typeof TweetsFragment> | undefined }) => {
  const tweets = useFragment(TweetsFragment, props.tweets);

  return (
    <ul>
      {tweets?.Tweets?.map(tweet => (
        <div key={tweet.id}>
          <Tweet tweet={tweet} />
          <TweetStats tweet={tweet} />
        </div>
      )) ?? null}
    </ul>
  );
};

const App = () => {
  const [query] = useQuery({ query: TweetAppQuery });

  return query.data == null ? null : <Tweets tweets={query.data} />;
};
