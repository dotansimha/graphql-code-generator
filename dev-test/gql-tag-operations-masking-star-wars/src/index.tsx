/* eslint-disable @typescript-eslint/no-unused-vars */
import React from 'react';
import { gql, FragmentType, useFragment } from '../gql';
import { useQuery } from 'urql';

const HeroDetailsWithFragment = gql(/* GraphQL */ `
  query HeroDetailsWithFragment($episode: Episode) {
    hero(episode: $episode) {
      ...HeroDetails
    }
  }
`);

const HeroDetailsFragment = gql(/* GraphQL */ `
  fragment HeroDetails on Character {
    __typename
    name
    ... on Human {
      height
    }
    ... on Droid {
      primaryFunction
    }
  }
`);

const HeroDetails = (props: { data: FragmentType<typeof HeroDetailsFragment> }) => {
  // masking union type
  const hero = useFragment(HeroDetailsFragment, props.data);

  switch (hero.__typename) {
    case 'Droid':
      return (
        <div>
          <p>Name: {hero.name}</p>
          <p>Primary function: {hero.primaryFunction}</p>
        </div>
      );
    case 'Human':
      return (
        <div>
          <p>Name: {hero.name}</p>
          <p>Height: {hero.height}</p>
        </div>
      );
    default: {
      // unreachable path
      const _exhaustiveCheck: never = hero;
      return null;
    }
  }
};

const HeroDetailsApp = () => {
  const [query] = useQuery({ query: HeroDetailsWithFragment });

  if (query.data?.hero == null) return null;

  return <HeroDetails data={query.data.hero} />;
};
