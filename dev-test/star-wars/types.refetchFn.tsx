import { gql } from '@apollo/client';
import * as Apollo from '@apollo/client';
export type Maybe<T> = T | null;
export type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]?: Maybe<T[SubKey]> };
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]: Maybe<T[SubKey]> };
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: string;
  String: string;
  Boolean: boolean;
  Int: number;
  Float: number;
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

/** The episodes in the Star Wars trilogy */
export enum Episode {
  /** Star Wars Episode IV: A New Hope, released in 1977. */
  Newhope = 'NEWHOPE',
  /** Star Wars Episode V: The Empire Strikes Back, released in 1980. */
  Empire = 'EMPIRE',
  /** Star Wars Episode VI: Return of the Jedi, released in 1983. */
  Jedi = 'JEDI',
}

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

/** Information for paginating this connection */
export type PageInfo = {
  __typename?: 'PageInfo';
  startCursor?: Maybe<Scalars['ID']>;
  endCursor?: Maybe<Scalars['ID']>;
  hasNextPage: Scalars['Boolean'];
};

/** Represents a review for a movie */
export type Review = {
  __typename?: 'Review';
  /** The number of stars this review gave, 1-5 */
  stars: Scalars['Int'];
  /** Comment about the movie */
  commentary?: Maybe<Scalars['String']>;
};

export type SearchResult = Human | Droid | Starship;

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

/** The input object sent when someone is creating a new review */
export type ReviewInput = {
  /** 0-5 stars */
  stars: Scalars['Int'];
  /** Comment about the movie, optional */
  commentary?: Maybe<Scalars['String']>;
  /** Favorite color, optional */
  favoriteColor?: Maybe<ColorInput>;
};

/** The input object sent when passing a color */
export type ColorInput = {
  red: Scalars['Int'];
  green: Scalars['Int'];
  blue: Scalars['Int'];
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
  return Apollo.useMutation<CreateReviewForEpisodeMutation, CreateReviewForEpisodeMutationVariables>(
    CreateReviewForEpisodeDocument,
    baseOptions
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
  return Apollo.useQuery<HeroAndFriendsNamesQuery, HeroAndFriendsNamesQueryVariables>(
    HeroAndFriendsNamesDocument,
    baseOptions
  );
}
export function useHeroAndFriendsNamesLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<HeroAndFriendsNamesQuery, HeroAndFriendsNamesQueryVariables>
) {
  return Apollo.useLazyQuery<HeroAndFriendsNamesQuery, HeroAndFriendsNamesQueryVariables>(
    HeroAndFriendsNamesDocument,
    baseOptions
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
  return Apollo.useQuery<HeroAppearsInQuery, HeroAppearsInQueryVariables>(HeroAppearsInDocument, baseOptions);
}
export function useHeroAppearsInLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<HeroAppearsInQuery, HeroAppearsInQueryVariables>
) {
  return Apollo.useLazyQuery<HeroAppearsInQuery, HeroAppearsInQueryVariables>(HeroAppearsInDocument, baseOptions);
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
  return Apollo.useQuery<HeroDetailsQuery, HeroDetailsQueryVariables>(HeroDetailsDocument, baseOptions);
}
export function useHeroDetailsLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<HeroDetailsQuery, HeroDetailsQueryVariables>
) {
  return Apollo.useLazyQuery<HeroDetailsQuery, HeroDetailsQueryVariables>(HeroDetailsDocument, baseOptions);
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
  return Apollo.useQuery<HeroDetailsWithFragmentQuery, HeroDetailsWithFragmentQueryVariables>(
    HeroDetailsWithFragmentDocument,
    baseOptions
  );
}
export function useHeroDetailsWithFragmentLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<HeroDetailsWithFragmentQuery, HeroDetailsWithFragmentQueryVariables>
) {
  return Apollo.useLazyQuery<HeroDetailsWithFragmentQuery, HeroDetailsWithFragmentQueryVariables>(
    HeroDetailsWithFragmentDocument,
    baseOptions
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
  return Apollo.useQuery<HeroNameQuery, HeroNameQueryVariables>(HeroNameDocument, baseOptions);
}
export function useHeroNameLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<HeroNameQuery, HeroNameQueryVariables>) {
  return Apollo.useLazyQuery<HeroNameQuery, HeroNameQueryVariables>(HeroNameDocument, baseOptions);
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
  return Apollo.useQuery<HeroNameConditionalInclusionQuery, HeroNameConditionalInclusionQueryVariables>(
    HeroNameConditionalInclusionDocument,
    baseOptions
  );
}
export function useHeroNameConditionalInclusionLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    HeroNameConditionalInclusionQuery,
    HeroNameConditionalInclusionQueryVariables
  >
) {
  return Apollo.useLazyQuery<HeroNameConditionalInclusionQuery, HeroNameConditionalInclusionQueryVariables>(
    HeroNameConditionalInclusionDocument,
    baseOptions
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
  return Apollo.useQuery<HeroNameConditionalExclusionQuery, HeroNameConditionalExclusionQueryVariables>(
    HeroNameConditionalExclusionDocument,
    baseOptions
  );
}
export function useHeroNameConditionalExclusionLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    HeroNameConditionalExclusionQuery,
    HeroNameConditionalExclusionQueryVariables
  >
) {
  return Apollo.useLazyQuery<HeroNameConditionalExclusionQuery, HeroNameConditionalExclusionQueryVariables>(
    HeroNameConditionalExclusionDocument,
    baseOptions
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
  return Apollo.useQuery<HeroParentTypeDependentFieldQuery, HeroParentTypeDependentFieldQueryVariables>(
    HeroParentTypeDependentFieldDocument,
    baseOptions
  );
}
export function useHeroParentTypeDependentFieldLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    HeroParentTypeDependentFieldQuery,
    HeroParentTypeDependentFieldQueryVariables
  >
) {
  return Apollo.useLazyQuery<HeroParentTypeDependentFieldQuery, HeroParentTypeDependentFieldQueryVariables>(
    HeroParentTypeDependentFieldDocument,
    baseOptions
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
  return Apollo.useQuery<HeroTypeDependentAliasedFieldQuery, HeroTypeDependentAliasedFieldQueryVariables>(
    HeroTypeDependentAliasedFieldDocument,
    baseOptions
  );
}
export function useHeroTypeDependentAliasedFieldLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    HeroTypeDependentAliasedFieldQuery,
    HeroTypeDependentAliasedFieldQueryVariables
  >
) {
  return Apollo.useLazyQuery<HeroTypeDependentAliasedFieldQuery, HeroTypeDependentAliasedFieldQueryVariables>(
    HeroTypeDependentAliasedFieldDocument,
    baseOptions
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
  return Apollo.useQuery<HumanWithNullHeightQuery, HumanWithNullHeightQueryVariables>(
    HumanWithNullHeightDocument,
    baseOptions
  );
}
export function useHumanWithNullHeightLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<HumanWithNullHeightQuery, HumanWithNullHeightQueryVariables>
) {
  return Apollo.useLazyQuery<HumanWithNullHeightQuery, HumanWithNullHeightQueryVariables>(
    HumanWithNullHeightDocument,
    baseOptions
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
  return Apollo.useQuery<TwoHeroesQuery, TwoHeroesQueryVariables>(TwoHeroesDocument, baseOptions);
}
export function useTwoHeroesLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<TwoHeroesQuery, TwoHeroesQueryVariables>
) {
  return Apollo.useLazyQuery<TwoHeroesQuery, TwoHeroesQueryVariables>(TwoHeroesDocument, baseOptions);
}
export type TwoHeroesQueryHookResult = ReturnType<typeof useTwoHeroesQuery>;
export type TwoHeroesLazyQueryHookResult = ReturnType<typeof useTwoHeroesLazyQuery>;
export type TwoHeroesQueryResult = Apollo.QueryResult<TwoHeroesQuery, TwoHeroesQueryVariables>;
export function refetchTwoHeroesQuery(variables?: TwoHeroesQueryVariables) {
  return { query: TwoHeroesDocument, variables: variables };
}
