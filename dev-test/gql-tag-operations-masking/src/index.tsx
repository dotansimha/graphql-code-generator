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

const TweetAuthor = (props: { tweet: FragmentType<typeof TweetAuthorFragment> }) => {
  const tweet = useFragment(TweetAuthorFragment, props.tweet);

  return <div>{tweet.author?.username}</div>;
};

const Tweets = (props: { tweets: FragmentType<typeof TweetsFragment> | null | undefined }) => {
  const tweets = useFragment(TweetsFragment, props.tweets);

  return <ul>{tweets?.Tweets?.map(tweet => <Tweet key={tweet.id} tweet={tweet} />) ?? null}</ul>;
};

const App = () => {
  const [query] = useQuery({ query: TweetAppQuery });

  return query.data == null ? null : <Tweets tweets={query.data} />;
};
