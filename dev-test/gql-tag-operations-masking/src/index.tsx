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

const TweetsQuery = gql(/* GraphQL */ `
  query TweetsQuery {
    Tweets {
      id
      ...TweetFragment
    }
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

const Tweets = () => {
  const [query] = useQuery({ query: TweetsQuery });

  return <ul>{query.data?.Tweets?.map(tweet => <Tweet key={tweet.id} tweet={tweet} />) ?? null}</ul>;
};
