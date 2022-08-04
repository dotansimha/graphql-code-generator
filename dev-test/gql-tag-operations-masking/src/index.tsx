/* eslint-disable @typescript-eslint/no-unused-vars */
import React from 'react';
import { gql, FragmentType, useFragment } from '../gql';
import { useQuery } from 'urql';

const TweetFragment = gql(/* GraphQL */ `
  fragment TweetFragment on Tweet {
    id
    body
    ...TweetAuthorFragment
  }
`);

const TweetAuthorFragment = gql(/* GraphQL */ `
  fragment TweetAuthorFragment on Tweet {
    id
    author {
      id
      username
    }
  }
`);

const TweetsFragment = gql(/* GraphQL */ `
  fragment TweetsFragment on Query {
    Tweets {
      id
      ...TweetFragment
    }
  }
`);

const TweetAppQuery = gql(/* GraphQL */ `
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

const TweetAuthor = (props: { tweet: FragmentType<typeof TweetAuthorFragment> }) => {
  const tweet = useFragment(TweetAuthorFragment, props.tweet);

  return <div>{tweet.author?.username}</div>;
};

const Tweets = (props: { tweets: FragmentType<typeof TweetsFragment> | undefined }) => {
  const tweets = useFragment(TweetsFragment, props.tweets);

  return <ul>{tweets?.Tweets?.map(tweet => <Tweet key={tweet.id} tweet={tweet} />) ?? null}</ul>;
};

const App = () => {
  const [query] = useQuery({ query: TweetAppQuery });

  return query.data == null ? null : <Tweets tweets={query.data} />;
};
