import { gql } from '@apollo/client';
import * as Apollo from '@apollo/client';
export type Maybe<T> = T | null;
export type InputMaybe<T> = Maybe<T>;
export type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]?: Maybe<T[SubKey]> };
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]: Maybe<T[SubKey]> };
const defaultOptions = {} as const;
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
  /** The movies this character appears in */
  appearsIn: Array<Maybe<Episode>>;
  /** The friends of the character, or an empty list if they have none */
  friends?: Maybe<Array<Maybe<Character>>>;
  /** The friends of the character exposed as a connection with edges */
  friendsConnection: FriendsConnection;
  /** The ID of the character */
  id: Scalars['ID'];
  /** The name of the character */
  name: Scalars['String'];
};

/** A character from the Star Wars universe */
export type CharacterFriendsConnectionArgs = {
  after?: InputMaybe<Scalars['ID']>;
  first?: InputMaybe<Scalars['Int']>;
};

/** The input object sent when passing a color */
export type ColorInput = {
  blue: Scalars['Int'];
  green: Scalars['Int'];
  red: Scalars['Int'];
};

/** An autonomous mechanical character in the Star Wars universe */
export type Droid = Character & {
  __typename?: 'Droid';
  /** The movies this droid appears in */
  appearsIn: Array<Maybe<Episode>>;
  /** This droid's friends, or an empty list if they have none */
  friends?: Maybe<Array<Maybe<Character>>>;
  /** The friends of the droid exposed as a connection with edges */
  friendsConnection: FriendsConnection;
  /** The ID of the droid */
  id: Scalars['ID'];
  /** What others call this droid */
  name: Scalars['String'];
  /** This droid's primary function */
  primaryFunction?: Maybe<Scalars['String']>;
};

/** An autonomous mechanical character in the Star Wars universe */
export type DroidFriendsConnectionArgs = {
  after?: InputMaybe<Scalars['ID']>;
  first?: InputMaybe<Scalars['Int']>;
};

/** The episodes in the Star Wars trilogy */
export enum Episode {
  /** Star Wars Episode V: The Empire Strikes Back, released in 1980. */
  Empire = 'EMPIRE',
  /** Star Wars Episode VI: Return of the Jedi, released in 1983. */
  Jedi = 'JEDI',
  /** Star Wars Episode IV: A New Hope, released in 1977. */
  Newhope = 'NEWHOPE',
}

/** A connection object for a character's friends */
export type FriendsConnection = {
  __typename?: 'FriendsConnection';
  /** The edges for each of the character's friends. */
  edges?: Maybe<Array<Maybe<FriendsEdge>>>;
  /** A list of the friends, as a convenience when edges are not needed. */
  friends?: Maybe<Array<Maybe<Character>>>;
  /** Information for paginating this connection */
  pageInfo: PageInfo;
  /** The total number of friends */
  totalCount?: Maybe<Scalars['Int']>;
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
  /** The movies this human appears in */
  appearsIn: Array<Maybe<Episode>>;
  /** This human's friends, or an empty list if they have none */
  friends?: Maybe<Array<Maybe<Character>>>;
  /** The friends of the human exposed as a connection with edges */
  friendsConnection: FriendsConnection;
  /** Height in the preferred unit, default is meters */
  height?: Maybe<Scalars['Float']>;
  /** The home planet of the human, or null if unknown */
  homePlanet?: Maybe<Scalars['String']>;
  /** The ID of the human */
  id: Scalars['ID'];
  /** Mass in kilograms, or null if unknown */
  mass?: Maybe<Scalars['Float']>;
  /** What this human calls themselves */
  name: Scalars['String'];
  /** A list of starships this person has piloted, or an empty list if none */
  starships?: Maybe<Array<Maybe<Starship>>>;
};

/** A humanoid creature from the Star Wars universe */
export type HumanFriendsConnectionArgs = {
  after?: InputMaybe<Scalars['ID']>;
  first?: InputMaybe<Scalars['Int']>;
};

/** A humanoid creature from the Star Wars universe */
export type HumanHeightArgs = {
  unit?: InputMaybe<LengthUnit>;
};

/** Units of height */
export enum LengthUnit {
  /** Primarily used in the United States */
  Foot = 'FOOT',
  /** The standard unit around the world */
  Meter = 'METER',
}

/** The mutation type, represents all updates we can make to our data */
export type Mutation = {
  __typename?: 'Mutation';
  createReview?: Maybe<Review>;
};

/** The mutation type, represents all updates we can make to our data */
export type MutationCreateReviewArgs = {
  episode?: InputMaybe<Episode>;
  review: ReviewInput;
};

/** Information for paginating this connection */
export type PageInfo = {
  __typename?: 'PageInfo';
  endCursor?: Maybe<Scalars['ID']>;
  hasNextPage: Scalars['Boolean'];
  startCursor?: Maybe<Scalars['ID']>;
};

/** The query type, represents all of the entry points into our object graph */
export type Query = {
  __typename?: 'Query';
  character?: Maybe<Character>;
  droid?: Maybe<Droid>;
  hero?: Maybe<Character>;
  human?: Maybe<Human>;
  reviews?: Maybe<Array<Maybe<Review>>>;
  search?: Maybe<Array<Maybe<SearchResult>>>;
  starship?: Maybe<Starship>;
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
export type QueryHeroArgs = {
  episode?: InputMaybe<Episode>;
};

/** The query type, represents all of the entry points into our object graph */
export type QueryHumanArgs = {
  id: Scalars['ID'];
};

/** The query type, represents all of the entry points into our object graph */
export type QueryReviewsArgs = {
  episode: Episode;
};

/** The query type, represents all of the entry points into our object graph */
export type QuerySearchArgs = {
  text?: InputMaybe<Scalars['String']>;
};

/** The query type, represents all of the entry points into our object graph */
export type QueryStarshipArgs = {
  id: Scalars['ID'];
};

/** Represents a review for a movie */
export type Review = {
  __typename?: 'Review';
  /** Comment about the movie */
  commentary?: Maybe<Scalars['String']>;
  /** The number of stars this review gave, 1-5 */
  stars: Scalars['Int'];
};

/** The input object sent when someone is creating a new review */
export type ReviewInput = {
  /** Comment about the movie, optional */
  commentary?: InputMaybe<Scalars['String']>;
  /** Favorite color, optional */
  favoriteColor?: InputMaybe<ColorInput>;
  /** 0-5 stars */
  stars: Scalars['Int'];
};

export type SearchResult = Droid | Human | Starship;

export type Starship = {
  __typename?: 'Starship';
  /** The ID of the starship */
  id: Scalars['ID'];
  /** Length of the starship, along the longest axis */
  length?: Maybe<Scalars['Float']>;
  /** The name of the starship */
  name: Scalars['String'];
};

export type StarshipLengthArgs = {
  unit?: InputMaybe<LengthUnit>;
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
export type CreateReviewForEpisodeMutationFn = Apollo.MutationFunction<
  CreateReviewForEpisodeMutation,
  CreateReviewForEpisodeMutationVariables
>;

/**
 * __useCreateReviewForEpisodeMutation__
 *
 * To run a mutation, you first call `useCreateReviewForEpisodeMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useCreateReviewForEpisodeMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [createReviewForEpisodeMutation, { data, loading, error }] = useCreateReviewForEpisodeMutation({
 *   variables: {
 *      episode: // value for 'episode'
 *      review: // value for 'review'
 *   },
 * });
 */
export function useCreateReviewForEpisodeMutation(
  baseOptions?: Apollo.MutationHookOptions<CreateReviewForEpisodeMutation, CreateReviewForEpisodeMutationVariables>
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useMutation<CreateReviewForEpisodeMutation, CreateReviewForEpisodeMutationVariables>(
    CreateReviewForEpisodeDocument,
    options
  );
}
export type CreateReviewForEpisodeMutationHookResult = ReturnType<typeof useCreateReviewForEpisodeMutation>;
export type CreateReviewForEpisodeMutationResult = Apollo.MutationResult<CreateReviewForEpisodeMutation>;
export type CreateReviewForEpisodeMutationOptions = Apollo.BaseMutationOptions<
  CreateReviewForEpisodeMutation,
  CreateReviewForEpisodeMutationVariables
>;
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

/**
 * __useHeroAndFriendsNamesQuery__
 *
 * To run a query within a React component, call `useHeroAndFriendsNamesQuery` and pass it any options that fit your needs.
 * When your component renders, `useHeroAndFriendsNamesQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useHeroAndFriendsNamesQuery({
 *   variables: {
 *      episode: // value for 'episode'
 *   },
 * });
 */
export function useHeroAndFriendsNamesQuery(
  baseOptions?: Apollo.QueryHookOptions<HeroAndFriendsNamesQuery, HeroAndFriendsNamesQueryVariables>
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<HeroAndFriendsNamesQuery, HeroAndFriendsNamesQueryVariables>(
    HeroAndFriendsNamesDocument,
    options
  );
}
export function useHeroAndFriendsNamesLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<HeroAndFriendsNamesQuery, HeroAndFriendsNamesQueryVariables>
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<HeroAndFriendsNamesQuery, HeroAndFriendsNamesQueryVariables>(
    HeroAndFriendsNamesDocument,
    options
  );
}
export type HeroAndFriendsNamesQueryHookResult = ReturnType<typeof useHeroAndFriendsNamesQuery>;
export type HeroAndFriendsNamesLazyQueryHookResult = ReturnType<typeof useHeroAndFriendsNamesLazyQuery>;
export type HeroAndFriendsNamesQueryResult = Apollo.QueryResult<
  HeroAndFriendsNamesQuery,
  HeroAndFriendsNamesQueryVariables
>;
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

/**
 * __useHeroAppearsInQuery__
 *
 * To run a query within a React component, call `useHeroAppearsInQuery` and pass it any options that fit your needs.
 * When your component renders, `useHeroAppearsInQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useHeroAppearsInQuery({
 *   variables: {
 *   },
 * });
 */
export function useHeroAppearsInQuery(
  baseOptions?: Apollo.QueryHookOptions<HeroAppearsInQuery, HeroAppearsInQueryVariables>
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<HeroAppearsInQuery, HeroAppearsInQueryVariables>(HeroAppearsInDocument, options);
}
export function useHeroAppearsInLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<HeroAppearsInQuery, HeroAppearsInQueryVariables>
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<HeroAppearsInQuery, HeroAppearsInQueryVariables>(HeroAppearsInDocument, options);
}
export type HeroAppearsInQueryHookResult = ReturnType<typeof useHeroAppearsInQuery>;
export type HeroAppearsInLazyQueryHookResult = ReturnType<typeof useHeroAppearsInLazyQuery>;
export type HeroAppearsInQueryResult = Apollo.QueryResult<HeroAppearsInQuery, HeroAppearsInQueryVariables>;
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

/**
 * __useHeroDetailsQuery__
 *
 * To run a query within a React component, call `useHeroDetailsQuery` and pass it any options that fit your needs.
 * When your component renders, `useHeroDetailsQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useHeroDetailsQuery({
 *   variables: {
 *      episode: // value for 'episode'
 *   },
 * });
 */
export function useHeroDetailsQuery(
  baseOptions?: Apollo.QueryHookOptions<HeroDetailsQuery, HeroDetailsQueryVariables>
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<HeroDetailsQuery, HeroDetailsQueryVariables>(HeroDetailsDocument, options);
}
export function useHeroDetailsLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<HeroDetailsQuery, HeroDetailsQueryVariables>
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<HeroDetailsQuery, HeroDetailsQueryVariables>(HeroDetailsDocument, options);
}
export type HeroDetailsQueryHookResult = ReturnType<typeof useHeroDetailsQuery>;
export type HeroDetailsLazyQueryHookResult = ReturnType<typeof useHeroDetailsLazyQuery>;
export type HeroDetailsQueryResult = Apollo.QueryResult<HeroDetailsQuery, HeroDetailsQueryVariables>;
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

/**
 * __useHeroDetailsWithFragmentQuery__
 *
 * To run a query within a React component, call `useHeroDetailsWithFragmentQuery` and pass it any options that fit your needs.
 * When your component renders, `useHeroDetailsWithFragmentQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useHeroDetailsWithFragmentQuery({
 *   variables: {
 *      episode: // value for 'episode'
 *   },
 * });
 */
export function useHeroDetailsWithFragmentQuery(
  baseOptions?: Apollo.QueryHookOptions<HeroDetailsWithFragmentQuery, HeroDetailsWithFragmentQueryVariables>
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<HeroDetailsWithFragmentQuery, HeroDetailsWithFragmentQueryVariables>(
    HeroDetailsWithFragmentDocument,
    options
  );
}
export function useHeroDetailsWithFragmentLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<HeroDetailsWithFragmentQuery, HeroDetailsWithFragmentQueryVariables>
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<HeroDetailsWithFragmentQuery, HeroDetailsWithFragmentQueryVariables>(
    HeroDetailsWithFragmentDocument,
    options
  );
}
export type HeroDetailsWithFragmentQueryHookResult = ReturnType<typeof useHeroDetailsWithFragmentQuery>;
export type HeroDetailsWithFragmentLazyQueryHookResult = ReturnType<typeof useHeroDetailsWithFragmentLazyQuery>;
export type HeroDetailsWithFragmentQueryResult = Apollo.QueryResult<
  HeroDetailsWithFragmentQuery,
  HeroDetailsWithFragmentQueryVariables
>;
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

/**
 * __useHeroNameQuery__
 *
 * To run a query within a React component, call `useHeroNameQuery` and pass it any options that fit your needs.
 * When your component renders, `useHeroNameQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useHeroNameQuery({
 *   variables: {
 *      episode: // value for 'episode'
 *   },
 * });
 */
export function useHeroNameQuery(baseOptions?: Apollo.QueryHookOptions<HeroNameQuery, HeroNameQueryVariables>) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<HeroNameQuery, HeroNameQueryVariables>(HeroNameDocument, options);
}
export function useHeroNameLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<HeroNameQuery, HeroNameQueryVariables>) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<HeroNameQuery, HeroNameQueryVariables>(HeroNameDocument, options);
}
export type HeroNameQueryHookResult = ReturnType<typeof useHeroNameQuery>;
export type HeroNameLazyQueryHookResult = ReturnType<typeof useHeroNameLazyQuery>;
export type HeroNameQueryResult = Apollo.QueryResult<HeroNameQuery, HeroNameQueryVariables>;
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

/**
 * __useHeroNameConditionalInclusionQuery__
 *
 * To run a query within a React component, call `useHeroNameConditionalInclusionQuery` and pass it any options that fit your needs.
 * When your component renders, `useHeroNameConditionalInclusionQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useHeroNameConditionalInclusionQuery({
 *   variables: {
 *      episode: // value for 'episode'
 *      includeName: // value for 'includeName'
 *   },
 * });
 */
export function useHeroNameConditionalInclusionQuery(
  baseOptions: Apollo.QueryHookOptions<HeroNameConditionalInclusionQuery, HeroNameConditionalInclusionQueryVariables>
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<HeroNameConditionalInclusionQuery, HeroNameConditionalInclusionQueryVariables>(
    HeroNameConditionalInclusionDocument,
    options
  );
}
export function useHeroNameConditionalInclusionLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    HeroNameConditionalInclusionQuery,
    HeroNameConditionalInclusionQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<HeroNameConditionalInclusionQuery, HeroNameConditionalInclusionQueryVariables>(
    HeroNameConditionalInclusionDocument,
    options
  );
}
export type HeroNameConditionalInclusionQueryHookResult = ReturnType<typeof useHeroNameConditionalInclusionQuery>;
export type HeroNameConditionalInclusionLazyQueryHookResult = ReturnType<
  typeof useHeroNameConditionalInclusionLazyQuery
>;
export type HeroNameConditionalInclusionQueryResult = Apollo.QueryResult<
  HeroNameConditionalInclusionQuery,
  HeroNameConditionalInclusionQueryVariables
>;
export function refetchHeroNameConditionalInclusionQuery(variables: HeroNameConditionalInclusionQueryVariables) {
  return { query: HeroNameConditionalInclusionDocument, variables: variables };
}
export const HeroNameConditionalExclusionDocument = gql`
  query HeroNameConditionalExclusion($episode: Episode, $skipName: Boolean!) {
    hero(episode: $episode) {
      name @skip(if: $skipName)
    }
  }
`;

/**
 * __useHeroNameConditionalExclusionQuery__
 *
 * To run a query within a React component, call `useHeroNameConditionalExclusionQuery` and pass it any options that fit your needs.
 * When your component renders, `useHeroNameConditionalExclusionQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useHeroNameConditionalExclusionQuery({
 *   variables: {
 *      episode: // value for 'episode'
 *      skipName: // value for 'skipName'
 *   },
 * });
 */
export function useHeroNameConditionalExclusionQuery(
  baseOptions: Apollo.QueryHookOptions<HeroNameConditionalExclusionQuery, HeroNameConditionalExclusionQueryVariables>
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<HeroNameConditionalExclusionQuery, HeroNameConditionalExclusionQueryVariables>(
    HeroNameConditionalExclusionDocument,
    options
  );
}
export function useHeroNameConditionalExclusionLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    HeroNameConditionalExclusionQuery,
    HeroNameConditionalExclusionQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<HeroNameConditionalExclusionQuery, HeroNameConditionalExclusionQueryVariables>(
    HeroNameConditionalExclusionDocument,
    options
  );
}
export type HeroNameConditionalExclusionQueryHookResult = ReturnType<typeof useHeroNameConditionalExclusionQuery>;
export type HeroNameConditionalExclusionLazyQueryHookResult = ReturnType<
  typeof useHeroNameConditionalExclusionLazyQuery
>;
export type HeroNameConditionalExclusionQueryResult = Apollo.QueryResult<
  HeroNameConditionalExclusionQuery,
  HeroNameConditionalExclusionQueryVariables
>;
export function refetchHeroNameConditionalExclusionQuery(variables: HeroNameConditionalExclusionQueryVariables) {
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

/**
 * __useHeroParentTypeDependentFieldQuery__
 *
 * To run a query within a React component, call `useHeroParentTypeDependentFieldQuery` and pass it any options that fit your needs.
 * When your component renders, `useHeroParentTypeDependentFieldQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useHeroParentTypeDependentFieldQuery({
 *   variables: {
 *      episode: // value for 'episode'
 *   },
 * });
 */
export function useHeroParentTypeDependentFieldQuery(
  baseOptions?: Apollo.QueryHookOptions<HeroParentTypeDependentFieldQuery, HeroParentTypeDependentFieldQueryVariables>
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<HeroParentTypeDependentFieldQuery, HeroParentTypeDependentFieldQueryVariables>(
    HeroParentTypeDependentFieldDocument,
    options
  );
}
export function useHeroParentTypeDependentFieldLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    HeroParentTypeDependentFieldQuery,
    HeroParentTypeDependentFieldQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<HeroParentTypeDependentFieldQuery, HeroParentTypeDependentFieldQueryVariables>(
    HeroParentTypeDependentFieldDocument,
    options
  );
}
export type HeroParentTypeDependentFieldQueryHookResult = ReturnType<typeof useHeroParentTypeDependentFieldQuery>;
export type HeroParentTypeDependentFieldLazyQueryHookResult = ReturnType<
  typeof useHeroParentTypeDependentFieldLazyQuery
>;
export type HeroParentTypeDependentFieldQueryResult = Apollo.QueryResult<
  HeroParentTypeDependentFieldQuery,
  HeroParentTypeDependentFieldQueryVariables
>;
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

/**
 * __useHeroTypeDependentAliasedFieldQuery__
 *
 * To run a query within a React component, call `useHeroTypeDependentAliasedFieldQuery` and pass it any options that fit your needs.
 * When your component renders, `useHeroTypeDependentAliasedFieldQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useHeroTypeDependentAliasedFieldQuery({
 *   variables: {
 *      episode: // value for 'episode'
 *   },
 * });
 */
export function useHeroTypeDependentAliasedFieldQuery(
  baseOptions?: Apollo.QueryHookOptions<HeroTypeDependentAliasedFieldQuery, HeroTypeDependentAliasedFieldQueryVariables>
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<HeroTypeDependentAliasedFieldQuery, HeroTypeDependentAliasedFieldQueryVariables>(
    HeroTypeDependentAliasedFieldDocument,
    options
  );
}
export function useHeroTypeDependentAliasedFieldLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    HeroTypeDependentAliasedFieldQuery,
    HeroTypeDependentAliasedFieldQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<HeroTypeDependentAliasedFieldQuery, HeroTypeDependentAliasedFieldQueryVariables>(
    HeroTypeDependentAliasedFieldDocument,
    options
  );
}
export type HeroTypeDependentAliasedFieldQueryHookResult = ReturnType<typeof useHeroTypeDependentAliasedFieldQuery>;
export type HeroTypeDependentAliasedFieldLazyQueryHookResult = ReturnType<
  typeof useHeroTypeDependentAliasedFieldLazyQuery
>;
export type HeroTypeDependentAliasedFieldQueryResult = Apollo.QueryResult<
  HeroTypeDependentAliasedFieldQuery,
  HeroTypeDependentAliasedFieldQueryVariables
>;
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

/**
 * __useHumanWithNullHeightQuery__
 *
 * To run a query within a React component, call `useHumanWithNullHeightQuery` and pass it any options that fit your needs.
 * When your component renders, `useHumanWithNullHeightQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useHumanWithNullHeightQuery({
 *   variables: {
 *   },
 * });
 */
export function useHumanWithNullHeightQuery(
  baseOptions?: Apollo.QueryHookOptions<HumanWithNullHeightQuery, HumanWithNullHeightQueryVariables>
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<HumanWithNullHeightQuery, HumanWithNullHeightQueryVariables>(
    HumanWithNullHeightDocument,
    options
  );
}
export function useHumanWithNullHeightLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<HumanWithNullHeightQuery, HumanWithNullHeightQueryVariables>
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<HumanWithNullHeightQuery, HumanWithNullHeightQueryVariables>(
    HumanWithNullHeightDocument,
    options
  );
}
export type HumanWithNullHeightQueryHookResult = ReturnType<typeof useHumanWithNullHeightQuery>;
export type HumanWithNullHeightLazyQueryHookResult = ReturnType<typeof useHumanWithNullHeightLazyQuery>;
export type HumanWithNullHeightQueryResult = Apollo.QueryResult<
  HumanWithNullHeightQuery,
  HumanWithNullHeightQueryVariables
>;
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

/**
 * __useTwoHeroesQuery__
 *
 * To run a query within a React component, call `useTwoHeroesQuery` and pass it any options that fit your needs.
 * When your component renders, `useTwoHeroesQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useTwoHeroesQuery({
 *   variables: {
 *   },
 * });
 */
export function useTwoHeroesQuery(baseOptions?: Apollo.QueryHookOptions<TwoHeroesQuery, TwoHeroesQueryVariables>) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<TwoHeroesQuery, TwoHeroesQueryVariables>(TwoHeroesDocument, options);
}
export function useTwoHeroesLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<TwoHeroesQuery, TwoHeroesQueryVariables>
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<TwoHeroesQuery, TwoHeroesQueryVariables>(TwoHeroesDocument, options);
}
export type TwoHeroesQueryHookResult = ReturnType<typeof useTwoHeroesQuery>;
export type TwoHeroesLazyQueryHookResult = ReturnType<typeof useTwoHeroesLazyQuery>;
export type TwoHeroesQueryResult = Apollo.QueryResult<TwoHeroesQuery, TwoHeroesQueryVariables>;
export function refetchTwoHeroesQuery(variables?: TwoHeroesQueryVariables) {
  return { query: TwoHeroesDocument, variables: variables };
}
