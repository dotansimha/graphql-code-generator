import gql from 'graphql-tag';
import * as ApolloReactCommon from '@apollo/react-common';
import * as React from 'react';
import * as ApolloReactComponents from '@apollo/react-components';
import * as ApolloReactHoc from '@apollo/react-hoc';
export type Maybe<T> = T | null;
export type Omit<T, K extends keyof T> = Pick<T, Exclude<keyof T, K>>;
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: string;
  String: string;
  Boolean: boolean;
  Int: number;
  Float: number;
};

/** A character from the Star Wars universe */
export type Character = {
  /** The ID of the character */
  id: Scalars['ID'];
  /** The name of the character */
  name: Scalars['String'];
  /** The friends of the character, or an empty list if they have none */
  friends?: Maybe<Array<Maybe<Character>>>;
  /** The friends of the character exposed as a connection with edges */
  friendsConnection: FriendsConnection;
  /** The movies this character appears in */
  appearsIn: Array<Maybe<Episode>>;
};

/** A character from the Star Wars universe */
export type CharacterFriendsConnectionArgs = {
  first?: Maybe<Scalars['Int']>;
  after?: Maybe<Scalars['ID']>;
};

/** The input object sent when passing a color */
export type ColorInput = {
  red: Scalars['Int'];
  green: Scalars['Int'];
  blue: Scalars['Int'];
};

/** An autonomous mechanical character in the Star Wars universe */
export type Droid = Character & {
  __typename?: 'Droid';
  /** The ID of the droid */
  id: Scalars['ID'];
  /** What others call this droid */
  name: Scalars['String'];
  /** This droid's friends, or an empty list if they have none */
  friends?: Maybe<Array<Maybe<Character>>>;
  /** The friends of the droid exposed as a connection with edges */
  friendsConnection: FriendsConnection;
  /** The movies this droid appears in */
  appearsIn: Array<Maybe<Episode>>;
  /** This droid's primary function */
  primaryFunction?: Maybe<Scalars['String']>;
};

/** An autonomous mechanical character in the Star Wars universe */
export type DroidFriendsConnectionArgs = {
  first?: Maybe<Scalars['Int']>;
  after?: Maybe<Scalars['ID']>;
};

/** The episodes in the Star Wars trilogy */
export enum Episode {
  /** Star Wars Episode IV: A New Hope, released in 1977. */
  Newhope = 'NEWHOPE',
  /** Star Wars Episode V: The Empire Strikes Back, released in 1980. */
  Empire = 'EMPIRE',
  /** Star Wars Episode VI: Return of the Jedi, released in 1983. */
  Jedi = 'JEDI',
}

/** A connection object for a character's friends */
export type FriendsConnection = {
  __typename?: 'FriendsConnection';
  /** The total number of friends */
  totalCount?: Maybe<Scalars['Int']>;
  /** The edges for each of the character's friends. */
  edges?: Maybe<Array<Maybe<FriendsEdge>>>;
  /** A list of the friends, as a convenience when edges are not needed. */
  friends?: Maybe<Array<Maybe<Character>>>;
  /** Information for paginating this connection */
  pageInfo: PageInfo;
};

/** An edge object for a character's friends */
export type FriendsEdge = {
  __typename?: 'FriendsEdge';
  /** A cursor used for pagination */
  cursor: Scalars['ID'];
  /** The character represented by this friendship edge */
  node?: Maybe<Character>;
};

/** A humanoid creature from the Star Wars universe */
export type Human = Character & {
  __typename?: 'Human';
  /** The ID of the human */
  id: Scalars['ID'];
  /** What this human calls themselves */
  name: Scalars['String'];
  /** The home planet of the human, or null if unknown */
  homePlanet?: Maybe<Scalars['String']>;
  /** Height in the preferred unit, default is meters */
  height?: Maybe<Scalars['Float']>;
  /** Mass in kilograms, or null if unknown */
  mass?: Maybe<Scalars['Float']>;
  /** This human's friends, or an empty list if they have none */
  friends?: Maybe<Array<Maybe<Character>>>;
  /** The friends of the human exposed as a connection with edges */
  friendsConnection: FriendsConnection;
  /** The movies this human appears in */
  appearsIn: Array<Maybe<Episode>>;
  /** A list of starships this person has piloted, or an empty list if none */
  starships?: Maybe<Array<Maybe<Starship>>>;
};

/** A humanoid creature from the Star Wars universe */
export type HumanHeightArgs = {
  unit?: Maybe<LengthUnit>;
};

/** A humanoid creature from the Star Wars universe */
export type HumanFriendsConnectionArgs = {
  first?: Maybe<Scalars['Int']>;
  after?: Maybe<Scalars['ID']>;
};

/** Units of height */
export enum LengthUnit {
  /** The standard unit around the world */
  Meter = 'METER',
  /** Primarily used in the United States */
  Foot = 'FOOT',
}

/** The mutation type, represents all updates we can make to our data */
export type Mutation = {
  __typename?: 'Mutation';
  createReview?: Maybe<Review>;
};

/** The mutation type, represents all updates we can make to our data */
export type MutationCreateReviewArgs = {
  episode?: Maybe<Episode>;
  review: ReviewInput;
};

/** Information for paginating this connection */
export type PageInfo = {
  __typename?: 'PageInfo';
  startCursor?: Maybe<Scalars['ID']>;
  endCursor?: Maybe<Scalars['ID']>;
  hasNextPage: Scalars['Boolean'];
};

/** The query type, represents all of the entry points into our object graph */
export type Query = {
  __typename?: 'Query';
  hero?: Maybe<Character>;
  reviews?: Maybe<Array<Maybe<Review>>>;
  search?: Maybe<Array<Maybe<SearchResult>>>;
  character?: Maybe<Character>;
  droid?: Maybe<Droid>;
  human?: Maybe<Human>;
  starship?: Maybe<Starship>;
};

/** The query type, represents all of the entry points into our object graph */
export type QueryHeroArgs = {
  episode?: Maybe<Episode>;
};

/** The query type, represents all of the entry points into our object graph */
export type QueryReviewsArgs = {
  episode: Episode;
};

/** The query type, represents all of the entry points into our object graph */
export type QuerySearchArgs = {
  text?: Maybe<Scalars['String']>;
};

/** The query type, represents all of the entry points into our object graph */
export type QueryCharacterArgs = {
  id: Scalars['ID'];
};

/** The query type, represents all of the entry points into our object graph */
export type QueryDroidArgs = {
  id: Scalars['ID'];
};

/** The query type, represents all of the entry points into our object graph */
export type QueryHumanArgs = {
  id: Scalars['ID'];
};

/** The query type, represents all of the entry points into our object graph */
export type QueryStarshipArgs = {
  id: Scalars['ID'];
};

/** Represents a review for a movie */
export type Review = {
  __typename?: 'Review';
  /** The number of stars this review gave, 1-5 */
  stars: Scalars['Int'];
  /** Comment about the movie */
  commentary?: Maybe<Scalars['String']>;
};

/** The input object sent when someone is creating a new review */
export type ReviewInput = {
  /** 0-5 stars */
  stars: Scalars['Int'];
  /** Comment about the movie, optional */
  commentary?: Maybe<Scalars['String']>;
  /** Favorite color, optional */
  favoriteColor?: Maybe<ColorInput>;
};

export type SearchResult = Human | Droid | Starship;

export type Starship = {
  __typename?: 'Starship';
  /** The ID of the starship */
  id: Scalars['ID'];
  /** The name of the starship */
  name: Scalars['String'];
  /** Length of the starship, along the longest axis */
  length?: Maybe<Scalars['Float']>;
};

export type StarshipLengthArgs = {
  unit?: Maybe<LengthUnit>;
};

export const HeroDetailsFragmentDoc = gql`
  fragment HeroDetails on Character {
    name
    ... on Human {
      height
    }
    ... on Droid {
      primaryFunction
    }
  }
`;
export const HumanFieldsFragmentDoc = gql`
  fragment HumanFields on Human {
    name
    mass
  }
`;
export const CreateReviewForEpisodeDocument = gql`
  mutation CreateReviewForEpisode($episode: Episode!, $review: ReviewInput!) {
    createReview(episode: $episode, review: $review) {
      stars
      commentary
    }
  }
`;
export type CreateReviewForEpisodeMutationFn = ApolloReactCommon.MutationFunction<CreateReviewForEpisodeMutation, CreateReviewForEpisodeMutationVariables>;
export type CreateReviewForEpisodeComponentProps = Omit<ApolloReactComponents.MutationComponentOptions<CreateReviewForEpisodeMutation, CreateReviewForEpisodeMutationVariables>, 'mutation'>;

export const CreateReviewForEpisodeComponent = (props: CreateReviewForEpisodeComponentProps) => (
  <ApolloReactComponents.Mutation<CreateReviewForEpisodeMutation, CreateReviewForEpisodeMutationVariables> mutation={CreateReviewForEpisodeDocument} {...props} />
);

export type CreateReviewForEpisodeProps<TChildProps = {}> = ApolloReactHoc.MutateProps<CreateReviewForEpisodeMutation, CreateReviewForEpisodeMutationVariables> & TChildProps;
export function withCreateReviewForEpisode<TProps, TChildProps = {}>(operationOptions?: ApolloReactHoc.OperationOption<TProps, CreateReviewForEpisodeMutation, CreateReviewForEpisodeMutationVariables, CreateReviewForEpisodeProps<TChildProps>>) {
  return ApolloReactHoc.withMutation<TProps, CreateReviewForEpisodeMutation, CreateReviewForEpisodeMutationVariables, CreateReviewForEpisodeProps<TChildProps>>(CreateReviewForEpisodeDocument, {
    alias: 'createReviewForEpisode',
    ...operationOptions,
  });
}
export type CreateReviewForEpisodeMutationResult = ApolloReactCommon.MutationResult<CreateReviewForEpisodeMutation>;
export type CreateReviewForEpisodeMutationOptions = ApolloReactCommon.BaseMutationOptions<CreateReviewForEpisodeMutation, CreateReviewForEpisodeMutationVariables>;
export const HeroAndFriendsNamesDocument = gql`
  query HeroAndFriendsNames($episode: Episode) {
    hero(episode: $episode) {
      name
      friends {
        name
      }
    }
  }
`;
export type HeroAndFriendsNamesComponentProps = Omit<ApolloReactComponents.QueryComponentOptions<HeroAndFriendsNamesQuery, HeroAndFriendsNamesQueryVariables>, 'query'>;

export const HeroAndFriendsNamesComponent = (props: HeroAndFriendsNamesComponentProps) => <ApolloReactComponents.Query<HeroAndFriendsNamesQuery, HeroAndFriendsNamesQueryVariables> query={HeroAndFriendsNamesDocument} {...props} />;

export type HeroAndFriendsNamesProps<TChildProps = {}> = ApolloReactHoc.DataProps<HeroAndFriendsNamesQuery, HeroAndFriendsNamesQueryVariables> & TChildProps;
export function withHeroAndFriendsNames<TProps, TChildProps = {}>(operationOptions?: ApolloReactHoc.OperationOption<TProps, HeroAndFriendsNamesQuery, HeroAndFriendsNamesQueryVariables, HeroAndFriendsNamesProps<TChildProps>>) {
  return ApolloReactHoc.withQuery<TProps, HeroAndFriendsNamesQuery, HeroAndFriendsNamesQueryVariables, HeroAndFriendsNamesProps<TChildProps>>(HeroAndFriendsNamesDocument, {
    alias: 'heroAndFriendsNames',
    ...operationOptions,
  });
}
export type HeroAndFriendsNamesQueryResult = ApolloReactCommon.QueryResult<HeroAndFriendsNamesQuery, HeroAndFriendsNamesQueryVariables>;
export function refetchHeroAndFriendsNamesQuery(variables?: HeroAndFriendsNamesQueryVariables) {
  return { query: HeroAndFriendsNamesDocument, variables: variables };
}
export const HeroAppearsInDocument = gql`
  query HeroAppearsIn {
    hero {
      name
      appearsIn
    }
  }
`;
export type HeroAppearsInComponentProps = Omit<ApolloReactComponents.QueryComponentOptions<HeroAppearsInQuery, HeroAppearsInQueryVariables>, 'query'>;

export const HeroAppearsInComponent = (props: HeroAppearsInComponentProps) => <ApolloReactComponents.Query<HeroAppearsInQuery, HeroAppearsInQueryVariables> query={HeroAppearsInDocument} {...props} />;

export type HeroAppearsInProps<TChildProps = {}> = ApolloReactHoc.DataProps<HeroAppearsInQuery, HeroAppearsInQueryVariables> & TChildProps;
export function withHeroAppearsIn<TProps, TChildProps = {}>(operationOptions?: ApolloReactHoc.OperationOption<TProps, HeroAppearsInQuery, HeroAppearsInQueryVariables, HeroAppearsInProps<TChildProps>>) {
  return ApolloReactHoc.withQuery<TProps, HeroAppearsInQuery, HeroAppearsInQueryVariables, HeroAppearsInProps<TChildProps>>(HeroAppearsInDocument, {
    alias: 'heroAppearsIn',
    ...operationOptions,
  });
}
export type HeroAppearsInQueryResult = ApolloReactCommon.QueryResult<HeroAppearsInQuery, HeroAppearsInQueryVariables>;
export function refetchHeroAppearsInQuery(variables?: HeroAppearsInQueryVariables) {
  return { query: HeroAppearsInDocument, variables: variables };
}
export const HeroDetailsDocument = gql`
  query HeroDetails($episode: Episode) {
    hero(episode: $episode) {
      name
      ... on Human {
        height
      }
      ... on Droid {
        primaryFunction
      }
    }
  }
`;
export type HeroDetailsComponentProps = Omit<ApolloReactComponents.QueryComponentOptions<HeroDetailsQuery, HeroDetailsQueryVariables>, 'query'>;

export const HeroDetailsComponent = (props: HeroDetailsComponentProps) => <ApolloReactComponents.Query<HeroDetailsQuery, HeroDetailsQueryVariables> query={HeroDetailsDocument} {...props} />;

export type HeroDetailsProps<TChildProps = {}> = ApolloReactHoc.DataProps<HeroDetailsQuery, HeroDetailsQueryVariables> & TChildProps;
export function withHeroDetails<TProps, TChildProps = {}>(operationOptions?: ApolloReactHoc.OperationOption<TProps, HeroDetailsQuery, HeroDetailsQueryVariables, HeroDetailsProps<TChildProps>>) {
  return ApolloReactHoc.withQuery<TProps, HeroDetailsQuery, HeroDetailsQueryVariables, HeroDetailsProps<TChildProps>>(HeroDetailsDocument, {
    alias: 'heroDetails',
    ...operationOptions,
  });
}
export type HeroDetailsQueryResult = ApolloReactCommon.QueryResult<HeroDetailsQuery, HeroDetailsQueryVariables>;
export function refetchHeroDetailsQuery(variables?: HeroDetailsQueryVariables) {
  return { query: HeroDetailsDocument, variables: variables };
}
export const HeroDetailsWithFragmentDocument = gql`
  query HeroDetailsWithFragment($episode: Episode) {
    hero(episode: $episode) {
      ...HeroDetails
    }
  }
  ${HeroDetailsFragmentDoc}
`;
export type HeroDetailsWithFragmentComponentProps = Omit<ApolloReactComponents.QueryComponentOptions<HeroDetailsWithFragmentQuery, HeroDetailsWithFragmentQueryVariables>, 'query'>;

export const HeroDetailsWithFragmentComponent = (props: HeroDetailsWithFragmentComponentProps) => <ApolloReactComponents.Query<HeroDetailsWithFragmentQuery, HeroDetailsWithFragmentQueryVariables> query={HeroDetailsWithFragmentDocument} {...props} />;

export type HeroDetailsWithFragmentProps<TChildProps = {}> = ApolloReactHoc.DataProps<HeroDetailsWithFragmentQuery, HeroDetailsWithFragmentQueryVariables> & TChildProps;
export function withHeroDetailsWithFragment<TProps, TChildProps = {}>(operationOptions?: ApolloReactHoc.OperationOption<TProps, HeroDetailsWithFragmentQuery, HeroDetailsWithFragmentQueryVariables, HeroDetailsWithFragmentProps<TChildProps>>) {
  return ApolloReactHoc.withQuery<TProps, HeroDetailsWithFragmentQuery, HeroDetailsWithFragmentQueryVariables, HeroDetailsWithFragmentProps<TChildProps>>(HeroDetailsWithFragmentDocument, {
    alias: 'heroDetailsWithFragment',
    ...operationOptions,
  });
}
export type HeroDetailsWithFragmentQueryResult = ApolloReactCommon.QueryResult<HeroDetailsWithFragmentQuery, HeroDetailsWithFragmentQueryVariables>;
export function refetchHeroDetailsWithFragmentQuery(variables?: HeroDetailsWithFragmentQueryVariables) {
  return { query: HeroDetailsWithFragmentDocument, variables: variables };
}
export const HeroNameDocument = gql`
  query HeroName($episode: Episode) {
    hero(episode: $episode) {
      name
    }
  }
`;
export type HeroNameComponentProps = Omit<ApolloReactComponents.QueryComponentOptions<HeroNameQuery, HeroNameQueryVariables>, 'query'>;

export const HeroNameComponent = (props: HeroNameComponentProps) => <ApolloReactComponents.Query<HeroNameQuery, HeroNameQueryVariables> query={HeroNameDocument} {...props} />;

export type HeroNameProps<TChildProps = {}> = ApolloReactHoc.DataProps<HeroNameQuery, HeroNameQueryVariables> & TChildProps;
export function withHeroName<TProps, TChildProps = {}>(operationOptions?: ApolloReactHoc.OperationOption<TProps, HeroNameQuery, HeroNameQueryVariables, HeroNameProps<TChildProps>>) {
  return ApolloReactHoc.withQuery<TProps, HeroNameQuery, HeroNameQueryVariables, HeroNameProps<TChildProps>>(HeroNameDocument, {
    alias: 'heroName',
    ...operationOptions,
  });
}
export type HeroNameQueryResult = ApolloReactCommon.QueryResult<HeroNameQuery, HeroNameQueryVariables>;
export function refetchHeroNameQuery(variables?: HeroNameQueryVariables) {
  return { query: HeroNameDocument, variables: variables };
}
export const HeroNameConditionalInclusionDocument = gql`
  query HeroNameConditionalInclusion($episode: Episode, $includeName: Boolean!) {
    hero(episode: $episode) {
      name @include(if: $includeName)
    }
  }
`;
export type HeroNameConditionalInclusionComponentProps = Omit<ApolloReactComponents.QueryComponentOptions<HeroNameConditionalInclusionQuery, HeroNameConditionalInclusionQueryVariables>, 'query'> &
  ({ variables: HeroNameConditionalInclusionQueryVariables; skip?: boolean } | { skip: boolean });

export const HeroNameConditionalInclusionComponent = (props: HeroNameConditionalInclusionComponentProps) => (
  <ApolloReactComponents.Query<HeroNameConditionalInclusionQuery, HeroNameConditionalInclusionQueryVariables> query={HeroNameConditionalInclusionDocument} {...props} />
);

export type HeroNameConditionalInclusionProps<TChildProps = {}> = ApolloReactHoc.DataProps<HeroNameConditionalInclusionQuery, HeroNameConditionalInclusionQueryVariables> & TChildProps;
export function withHeroNameConditionalInclusion<TProps, TChildProps = {}>(
  operationOptions?: ApolloReactHoc.OperationOption<TProps, HeroNameConditionalInclusionQuery, HeroNameConditionalInclusionQueryVariables, HeroNameConditionalInclusionProps<TChildProps>>
) {
  return ApolloReactHoc.withQuery<TProps, HeroNameConditionalInclusionQuery, HeroNameConditionalInclusionQueryVariables, HeroNameConditionalInclusionProps<TChildProps>>(HeroNameConditionalInclusionDocument, {
    alias: 'heroNameConditionalInclusion',
    ...operationOptions,
  });
}
export type HeroNameConditionalInclusionQueryResult = ApolloReactCommon.QueryResult<HeroNameConditionalInclusionQuery, HeroNameConditionalInclusionQueryVariables>;
export function refetchHeroNameConditionalInclusionQuery(variables?: HeroNameConditionalInclusionQueryVariables) {
  return { query: HeroNameConditionalInclusionDocument, variables: variables };
}
export const HeroNameConditionalExclusionDocument = gql`
  query HeroNameConditionalExclusion($episode: Episode, $skipName: Boolean!) {
    hero(episode: $episode) {
      name @skip(if: $skipName)
    }
  }
`;
export type HeroNameConditionalExclusionComponentProps = Omit<ApolloReactComponents.QueryComponentOptions<HeroNameConditionalExclusionQuery, HeroNameConditionalExclusionQueryVariables>, 'query'> &
  ({ variables: HeroNameConditionalExclusionQueryVariables; skip?: boolean } | { skip: boolean });

export const HeroNameConditionalExclusionComponent = (props: HeroNameConditionalExclusionComponentProps) => (
  <ApolloReactComponents.Query<HeroNameConditionalExclusionQuery, HeroNameConditionalExclusionQueryVariables> query={HeroNameConditionalExclusionDocument} {...props} />
);

export type HeroNameConditionalExclusionProps<TChildProps = {}> = ApolloReactHoc.DataProps<HeroNameConditionalExclusionQuery, HeroNameConditionalExclusionQueryVariables> & TChildProps;
export function withHeroNameConditionalExclusion<TProps, TChildProps = {}>(
  operationOptions?: ApolloReactHoc.OperationOption<TProps, HeroNameConditionalExclusionQuery, HeroNameConditionalExclusionQueryVariables, HeroNameConditionalExclusionProps<TChildProps>>
) {
  return ApolloReactHoc.withQuery<TProps, HeroNameConditionalExclusionQuery, HeroNameConditionalExclusionQueryVariables, HeroNameConditionalExclusionProps<TChildProps>>(HeroNameConditionalExclusionDocument, {
    alias: 'heroNameConditionalExclusion',
    ...operationOptions,
  });
}
export type HeroNameConditionalExclusionQueryResult = ApolloReactCommon.QueryResult<HeroNameConditionalExclusionQuery, HeroNameConditionalExclusionQueryVariables>;
export function refetchHeroNameConditionalExclusionQuery(variables?: HeroNameConditionalExclusionQueryVariables) {
  return { query: HeroNameConditionalExclusionDocument, variables: variables };
}
export const HeroParentTypeDependentFieldDocument = gql`
  query HeroParentTypeDependentField($episode: Episode) {
    hero(episode: $episode) {
      name
      ... on Human {
        friends {
          name
          ... on Human {
            height(unit: FOOT)
          }
        }
      }
      ... on Droid {
        friends {
          name
          ... on Human {
            height(unit: METER)
          }
        }
      }
    }
  }
`;
export type HeroParentTypeDependentFieldComponentProps = Omit<ApolloReactComponents.QueryComponentOptions<HeroParentTypeDependentFieldQuery, HeroParentTypeDependentFieldQueryVariables>, 'query'>;

export const HeroParentTypeDependentFieldComponent = (props: HeroParentTypeDependentFieldComponentProps) => (
  <ApolloReactComponents.Query<HeroParentTypeDependentFieldQuery, HeroParentTypeDependentFieldQueryVariables> query={HeroParentTypeDependentFieldDocument} {...props} />
);

export type HeroParentTypeDependentFieldProps<TChildProps = {}> = ApolloReactHoc.DataProps<HeroParentTypeDependentFieldQuery, HeroParentTypeDependentFieldQueryVariables> & TChildProps;
export function withHeroParentTypeDependentField<TProps, TChildProps = {}>(
  operationOptions?: ApolloReactHoc.OperationOption<TProps, HeroParentTypeDependentFieldQuery, HeroParentTypeDependentFieldQueryVariables, HeroParentTypeDependentFieldProps<TChildProps>>
) {
  return ApolloReactHoc.withQuery<TProps, HeroParentTypeDependentFieldQuery, HeroParentTypeDependentFieldQueryVariables, HeroParentTypeDependentFieldProps<TChildProps>>(HeroParentTypeDependentFieldDocument, {
    alias: 'heroParentTypeDependentField',
    ...operationOptions,
  });
}
export type HeroParentTypeDependentFieldQueryResult = ApolloReactCommon.QueryResult<HeroParentTypeDependentFieldQuery, HeroParentTypeDependentFieldQueryVariables>;
export function refetchHeroParentTypeDependentFieldQuery(variables?: HeroParentTypeDependentFieldQueryVariables) {
  return { query: HeroParentTypeDependentFieldDocument, variables: variables };
}
export const HeroTypeDependentAliasedFieldDocument = gql`
  query HeroTypeDependentAliasedField($episode: Episode) {
    hero(episode: $episode) {
      ... on Human {
        property: homePlanet
      }
      ... on Droid {
        property: primaryFunction
      }
    }
  }
`;
export type HeroTypeDependentAliasedFieldComponentProps = Omit<ApolloReactComponents.QueryComponentOptions<HeroTypeDependentAliasedFieldQuery, HeroTypeDependentAliasedFieldQueryVariables>, 'query'>;

export const HeroTypeDependentAliasedFieldComponent = (props: HeroTypeDependentAliasedFieldComponentProps) => (
  <ApolloReactComponents.Query<HeroTypeDependentAliasedFieldQuery, HeroTypeDependentAliasedFieldQueryVariables> query={HeroTypeDependentAliasedFieldDocument} {...props} />
);

export type HeroTypeDependentAliasedFieldProps<TChildProps = {}> = ApolloReactHoc.DataProps<HeroTypeDependentAliasedFieldQuery, HeroTypeDependentAliasedFieldQueryVariables> & TChildProps;
export function withHeroTypeDependentAliasedField<TProps, TChildProps = {}>(
  operationOptions?: ApolloReactHoc.OperationOption<TProps, HeroTypeDependentAliasedFieldQuery, HeroTypeDependentAliasedFieldQueryVariables, HeroTypeDependentAliasedFieldProps<TChildProps>>
) {
  return ApolloReactHoc.withQuery<TProps, HeroTypeDependentAliasedFieldQuery, HeroTypeDependentAliasedFieldQueryVariables, HeroTypeDependentAliasedFieldProps<TChildProps>>(HeroTypeDependentAliasedFieldDocument, {
    alias: 'heroTypeDependentAliasedField',
    ...operationOptions,
  });
}
export type HeroTypeDependentAliasedFieldQueryResult = ApolloReactCommon.QueryResult<HeroTypeDependentAliasedFieldQuery, HeroTypeDependentAliasedFieldQueryVariables>;
export function refetchHeroTypeDependentAliasedFieldQuery(variables?: HeroTypeDependentAliasedFieldQueryVariables) {
  return { query: HeroTypeDependentAliasedFieldDocument, variables: variables };
}
export const HumanWithNullHeightDocument = gql`
  query HumanWithNullHeight {
    human(id: 1004) {
      ...HumanFields
    }
  }
  ${HumanFieldsFragmentDoc}
`;
export type HumanWithNullHeightComponentProps = Omit<ApolloReactComponents.QueryComponentOptions<HumanWithNullHeightQuery, HumanWithNullHeightQueryVariables>, 'query'>;

export const HumanWithNullHeightComponent = (props: HumanWithNullHeightComponentProps) => <ApolloReactComponents.Query<HumanWithNullHeightQuery, HumanWithNullHeightQueryVariables> query={HumanWithNullHeightDocument} {...props} />;

export type HumanWithNullHeightProps<TChildProps = {}> = ApolloReactHoc.DataProps<HumanWithNullHeightQuery, HumanWithNullHeightQueryVariables> & TChildProps;
export function withHumanWithNullHeight<TProps, TChildProps = {}>(operationOptions?: ApolloReactHoc.OperationOption<TProps, HumanWithNullHeightQuery, HumanWithNullHeightQueryVariables, HumanWithNullHeightProps<TChildProps>>) {
  return ApolloReactHoc.withQuery<TProps, HumanWithNullHeightQuery, HumanWithNullHeightQueryVariables, HumanWithNullHeightProps<TChildProps>>(HumanWithNullHeightDocument, {
    alias: 'humanWithNullHeight',
    ...operationOptions,
  });
}
export type HumanWithNullHeightQueryResult = ApolloReactCommon.QueryResult<HumanWithNullHeightQuery, HumanWithNullHeightQueryVariables>;
export function refetchHumanWithNullHeightQuery(variables?: HumanWithNullHeightQueryVariables) {
  return { query: HumanWithNullHeightDocument, variables: variables };
}
export const TwoHeroesDocument = gql`
  query TwoHeroes {
    r2: hero {
      name
    }
    luke: hero(episode: EMPIRE) {
      name
    }
  }
`;
export type TwoHeroesComponentProps = Omit<ApolloReactComponents.QueryComponentOptions<TwoHeroesQuery, TwoHeroesQueryVariables>, 'query'>;

export const TwoHeroesComponent = (props: TwoHeroesComponentProps) => <ApolloReactComponents.Query<TwoHeroesQuery, TwoHeroesQueryVariables> query={TwoHeroesDocument} {...props} />;

export type TwoHeroesProps<TChildProps = {}> = ApolloReactHoc.DataProps<TwoHeroesQuery, TwoHeroesQueryVariables> & TChildProps;
export function withTwoHeroes<TProps, TChildProps = {}>(operationOptions?: ApolloReactHoc.OperationOption<TProps, TwoHeroesQuery, TwoHeroesQueryVariables, TwoHeroesProps<TChildProps>>) {
  return ApolloReactHoc.withQuery<TProps, TwoHeroesQuery, TwoHeroesQueryVariables, TwoHeroesProps<TChildProps>>(TwoHeroesDocument, {
    alias: 'twoHeroes',
    ...operationOptions,
  });
}
export type TwoHeroesQueryResult = ApolloReactCommon.QueryResult<TwoHeroesQuery, TwoHeroesQueryVariables>;
export function refetchTwoHeroesQuery(variables?: TwoHeroesQueryVariables) {
  return { query: TwoHeroesDocument, variables: variables };
}
