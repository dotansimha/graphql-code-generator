/* eslint-disable */
import { TypedDocumentNode as DocumentNode } from '@graphql-typed-document-node/core';
export type Maybe<T> = T | null;
export type InputMaybe<T> = Maybe<T>;
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

export type HeroDetailsWithFragmentQueryVariables = Exact<{
  episode?: InputMaybe<Episode>;
}>;

export type HeroDetailsWithFragmentQuery = {
  __typename?: 'Query';
  hero?:
    | ({ __typename?: 'Droid' } & { ' $fragmentRefs': { HeroDetails_Droid_Fragment: HeroDetails_Droid_Fragment } })
    | ({ __typename?: 'Human' } & { ' $fragmentRefs': { HeroDetails_Human_Fragment: HeroDetails_Human_Fragment } })
    | null;
};

type HeroDetails_Droid_Fragment = { __typename: 'Droid'; primaryFunction?: string | null; name: string } & {
  ' $fragmentName'?: 'HeroDetails_Droid_Fragment';
};

type HeroDetails_Human_Fragment = { __typename: 'Human'; height?: number | null; name: string } & {
  ' $fragmentName'?: 'HeroDetails_Human_Fragment';
};

export type HeroDetailsFragment = HeroDetails_Droid_Fragment | HeroDetails_Human_Fragment;

export const HeroDetailsFragmentDoc = {
  kind: 'Document',
  definitions: [
    {
      kind: 'FragmentDefinition',
      name: { kind: 'Name', value: 'HeroDetails' },
      typeCondition: { kind: 'NamedType', name: { kind: 'Name', value: 'Character' } },
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          { kind: 'Field', name: { kind: 'Name', value: '__typename' } },
          { kind: 'Field', name: { kind: 'Name', value: 'name' } },
          {
            kind: 'InlineFragment',
            typeCondition: { kind: 'NamedType', name: { kind: 'Name', value: 'Human' } },
            selectionSet: {
              kind: 'SelectionSet',
              selections: [{ kind: 'Field', name: { kind: 'Name', value: 'height' } }],
            },
          },
          {
            kind: 'InlineFragment',
            typeCondition: { kind: 'NamedType', name: { kind: 'Name', value: 'Droid' } },
            selectionSet: {
              kind: 'SelectionSet',
              selections: [{ kind: 'Field', name: { kind: 'Name', value: 'primaryFunction' } }],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<HeroDetailsFragment, unknown>;
export const HeroDetailsWithFragmentDocument = {
  kind: 'Document',
  definitions: [
    {
      kind: 'OperationDefinition',
      operation: 'query',
      name: { kind: 'Name', value: 'HeroDetailsWithFragment' },
      variableDefinitions: [
        {
          kind: 'VariableDefinition',
          variable: { kind: 'Variable', name: { kind: 'Name', value: 'episode' } },
          type: { kind: 'NamedType', name: { kind: 'Name', value: 'Episode' } },
        },
      ],
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'hero' },
            arguments: [
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'episode' },
                value: { kind: 'Variable', name: { kind: 'Name', value: 'episode' } },
              },
            ],
            selectionSet: {
              kind: 'SelectionSet',
              selections: [{ kind: 'FragmentSpread', name: { kind: 'Name', value: 'HeroDetails' } }],
            },
          },
        ],
      },
    },
    ...HeroDetailsFragmentDoc.definitions,
  ],
} as unknown as DocumentNode<HeroDetailsWithFragmentQuery, HeroDetailsWithFragmentQueryVariables>;
