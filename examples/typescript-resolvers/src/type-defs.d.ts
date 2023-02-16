import { GraphQLResolveInfo } from 'graphql';
export type Maybe<T> = T | null;
export type InputMaybe<T> = Maybe<T>;
export type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]?: Maybe<T[SubKey]> };
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]: Maybe<T[SubKey]> };
export type RequireFields<T, K extends keyof T> = Omit<T, K> & { [P in K]-?: NonNullable<T[P]> };
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: string;
  String: string;
  Boolean: boolean;
  Int: number;
  Float: number;
};

/** A single film. */
export type Film = Node & {
  __typename?: 'Film';
  characterConnection?: Maybe<FilmCharactersConnection>;
  /** The ISO 8601 date format of the time that this resource was created. */
  created?: Maybe<Scalars['String']>;
  /** The name of the director of this film. */
  director?: Maybe<Scalars['String']>;
  /** The ISO 8601 date format of the time that this resource was edited. */
  edited?: Maybe<Scalars['String']>;
  /** The episode number of this film. */
  episodeID?: Maybe<Scalars['Int']>;
  /** The ID of an object */
  id: Scalars['ID'];
  /** The opening paragraphs at the beginning of this film. */
  openingCrawl?: Maybe<Scalars['String']>;
  planetConnection?: Maybe<FilmPlanetsConnection>;
  /** The name(s) of the producer(s) of this film. */
  producers?: Maybe<Array<Maybe<Scalars['String']>>>;
  /** The ISO 8601 date format of film release at original creator country. */
  releaseDate?: Maybe<Scalars['String']>;
  speciesConnection?: Maybe<FilmSpeciesConnection>;
  starshipConnection?: Maybe<FilmStarshipsConnection>;
  /** The title of this film. */
  title?: Maybe<Scalars['String']>;
  vehicleConnection?: Maybe<FilmVehiclesConnection>;
};

/** A single film. */
export type FilmCharacterConnectionArgs = {
  after?: InputMaybe<Scalars['String']>;
  before?: InputMaybe<Scalars['String']>;
  first?: InputMaybe<Scalars['Int']>;
  last?: InputMaybe<Scalars['Int']>;
};

/** A single film. */
export type FilmPlanetConnectionArgs = {
  after?: InputMaybe<Scalars['String']>;
  before?: InputMaybe<Scalars['String']>;
  first?: InputMaybe<Scalars['Int']>;
  last?: InputMaybe<Scalars['Int']>;
};

/** A single film. */
export type FilmSpeciesConnectionArgs = {
  after?: InputMaybe<Scalars['String']>;
  before?: InputMaybe<Scalars['String']>;
  first?: InputMaybe<Scalars['Int']>;
  last?: InputMaybe<Scalars['Int']>;
};

/** A single film. */
export type FilmStarshipConnectionArgs = {
  after?: InputMaybe<Scalars['String']>;
  before?: InputMaybe<Scalars['String']>;
  first?: InputMaybe<Scalars['Int']>;
  last?: InputMaybe<Scalars['Int']>;
};

/** A single film. */
export type FilmVehicleConnectionArgs = {
  after?: InputMaybe<Scalars['String']>;
  before?: InputMaybe<Scalars['String']>;
  first?: InputMaybe<Scalars['Int']>;
  last?: InputMaybe<Scalars['Int']>;
};

/** A connection to a list of items. */
export type FilmCharactersConnection = {
  __typename?: 'FilmCharactersConnection';
  /**
   * A list of all of the objects returned in the connection. This is a convenience
   * field provided for quickly exploring the API; rather than querying for
   * "{ edges { node } }" when no edge data is needed, this field can be be used
   * instead. Note that when clients like Relay need to fetch the "cursor" field on
   * the edge to enable efficient pagination, this shortcut cannot be used, and the
   * full "{ edges { node } }" version should be used instead.
   */
  characters?: Maybe<Array<Maybe<Person>>>;
  /** A list of edges. */
  edges?: Maybe<Array<Maybe<FilmCharactersEdge>>>;
  /** Information to aid in pagination. */
  pageInfo: PageInfo;
  /**
   * A count of the total number of objects in this connection, ignoring pagination.
   * This allows a client to fetch the first five objects by passing "5" as the
   * argument to "first", then fetch the total count so it could display "5 of 83",
   * for example.
   */
  totalCount?: Maybe<Scalars['Int']>;
};

/** An edge in a connection. */
export type FilmCharactersEdge = {
  __typename?: 'FilmCharactersEdge';
  /** A cursor for use in pagination */
  cursor: Scalars['String'];
  /** The item at the end of the edge */
  node?: Maybe<Person>;
};

/** A connection to a list of items. */
export type FilmPlanetsConnection = {
  __typename?: 'FilmPlanetsConnection';
  /** A list of edges. */
  edges?: Maybe<Array<Maybe<FilmPlanetsEdge>>>;
  /** Information to aid in pagination. */
  pageInfo: PageInfo;
  /**
   * A list of all of the objects returned in the connection. This is a convenience
   * field provided for quickly exploring the API; rather than querying for
   * "{ edges { node } }" when no edge data is needed, this field can be be used
   * instead. Note that when clients like Relay need to fetch the "cursor" field on
   * the edge to enable efficient pagination, this shortcut cannot be used, and the
   * full "{ edges { node } }" version should be used instead.
   */
  planets?: Maybe<Array<Maybe<Planet>>>;
  /**
   * A count of the total number of objects in this connection, ignoring pagination.
   * This allows a client to fetch the first five objects by passing "5" as the
   * argument to "first", then fetch the total count so it could display "5 of 83",
   * for example.
   */
  totalCount?: Maybe<Scalars['Int']>;
};

/** An edge in a connection. */
export type FilmPlanetsEdge = {
  __typename?: 'FilmPlanetsEdge';
  /** A cursor for use in pagination */
  cursor: Scalars['String'];
  /** The item at the end of the edge */
  node?: Maybe<Planet>;
};

/** A connection to a list of items. */
export type FilmSpeciesConnection = {
  __typename?: 'FilmSpeciesConnection';
  /** A list of edges. */
  edges?: Maybe<Array<Maybe<FilmSpeciesEdge>>>;
  /** Information to aid in pagination. */
  pageInfo: PageInfo;
  /**
   * A list of all of the objects returned in the connection. This is a convenience
   * field provided for quickly exploring the API; rather than querying for
   * "{ edges { node } }" when no edge data is needed, this field can be be used
   * instead. Note that when clients like Relay need to fetch the "cursor" field on
   * the edge to enable efficient pagination, this shortcut cannot be used, and the
   * full "{ edges { node } }" version should be used instead.
   */
  species?: Maybe<Array<Maybe<Species>>>;
  /**
   * A count of the total number of objects in this connection, ignoring pagination.
   * This allows a client to fetch the first five objects by passing "5" as the
   * argument to "first", then fetch the total count so it could display "5 of 83",
   * for example.
   */
  totalCount?: Maybe<Scalars['Int']>;
};

/** An edge in a connection. */
export type FilmSpeciesEdge = {
  __typename?: 'FilmSpeciesEdge';
  /** A cursor for use in pagination */
  cursor: Scalars['String'];
  /** The item at the end of the edge */
  node?: Maybe<Species>;
};

/** A connection to a list of items. */
export type FilmStarshipsConnection = {
  __typename?: 'FilmStarshipsConnection';
  /** A list of edges. */
  edges?: Maybe<Array<Maybe<FilmStarshipsEdge>>>;
  /** Information to aid in pagination. */
  pageInfo: PageInfo;
  /**
   * A list of all of the objects returned in the connection. This is a convenience
   * field provided for quickly exploring the API; rather than querying for
   * "{ edges { node } }" when no edge data is needed, this field can be be used
   * instead. Note that when clients like Relay need to fetch the "cursor" field on
   * the edge to enable efficient pagination, this shortcut cannot be used, and the
   * full "{ edges { node } }" version should be used instead.
   */
  starships?: Maybe<Array<Maybe<Starship>>>;
  /**
   * A count of the total number of objects in this connection, ignoring pagination.
   * This allows a client to fetch the first five objects by passing "5" as the
   * argument to "first", then fetch the total count so it could display "5 of 83",
   * for example.
   */
  totalCount?: Maybe<Scalars['Int']>;
};

/** An edge in a connection. */
export type FilmStarshipsEdge = {
  __typename?: 'FilmStarshipsEdge';
  /** A cursor for use in pagination */
  cursor: Scalars['String'];
  /** The item at the end of the edge */
  node?: Maybe<Starship>;
};

/** A connection to a list of items. */
export type FilmVehiclesConnection = {
  __typename?: 'FilmVehiclesConnection';
  /** A list of edges. */
  edges?: Maybe<Array<Maybe<FilmVehiclesEdge>>>;
  /** Information to aid in pagination. */
  pageInfo: PageInfo;
  /**
   * A count of the total number of objects in this connection, ignoring pagination.
   * This allows a client to fetch the first five objects by passing "5" as the
   * argument to "first", then fetch the total count so it could display "5 of 83",
   * for example.
   */
  totalCount?: Maybe<Scalars['Int']>;
  /**
   * A list of all of the objects returned in the connection. This is a convenience
   * field provided for quickly exploring the API; rather than querying for
   * "{ edges { node } }" when no edge data is needed, this field can be be used
   * instead. Note that when clients like Relay need to fetch the "cursor" field on
   * the edge to enable efficient pagination, this shortcut cannot be used, and the
   * full "{ edges { node } }" version should be used instead.
   */
  vehicles?: Maybe<Array<Maybe<Vehicle>>>;
};

/** An edge in a connection. */
export type FilmVehiclesEdge = {
  __typename?: 'FilmVehiclesEdge';
  /** A cursor for use in pagination */
  cursor: Scalars['String'];
  /** The item at the end of the edge */
  node?: Maybe<Vehicle>;
};

/** A connection to a list of items. */
export type FilmsConnection = {
  __typename?: 'FilmsConnection';
  /** A list of edges. */
  edges?: Maybe<Array<Maybe<FilmsEdge>>>;
  /**
   * A list of all of the objects returned in the connection. This is a convenience
   * field provided for quickly exploring the API; rather than querying for
   * "{ edges { node } }" when no edge data is needed, this field can be be used
   * instead. Note that when clients like Relay need to fetch the "cursor" field on
   * the edge to enable efficient pagination, this shortcut cannot be used, and the
   * full "{ edges { node } }" version should be used instead.
   */
  films?: Maybe<Array<Maybe<Film>>>;
  /** Information to aid in pagination. */
  pageInfo: PageInfo;
  /**
   * A count of the total number of objects in this connection, ignoring pagination.
   * This allows a client to fetch the first five objects by passing "5" as the
   * argument to "first", then fetch the total count so it could display "5 of 83",
   * for example.
   */
  totalCount?: Maybe<Scalars['Int']>;
};

/** An edge in a connection. */
export type FilmsEdge = {
  __typename?: 'FilmsEdge';
  /** A cursor for use in pagination */
  cursor: Scalars['String'];
  /** The item at the end of the edge */
  node?: Maybe<Film>;
};

/** An object with an ID */
export type Node = {
  /** The id of the object. */
  id: Scalars['ID'];
};

/** Information about pagination in a connection. */
export type PageInfo = {
  __typename?: 'PageInfo';
  /** When paginating forwards, the cursor to continue. */
  endCursor?: Maybe<Scalars['String']>;
  /** When paginating forwards, are there more items? */
  hasNextPage: Scalars['Boolean'];
  /** When paginating backwards, are there more items? */
  hasPreviousPage: Scalars['Boolean'];
  /** When paginating backwards, the cursor to continue. */
  startCursor?: Maybe<Scalars['String']>;
};

/** A connection to a list of items. */
export type PeopleConnection = {
  __typename?: 'PeopleConnection';
  /** A list of edges. */
  edges?: Maybe<Array<Maybe<PeopleEdge>>>;
  /** Information to aid in pagination. */
  pageInfo: PageInfo;
  /**
   * A list of all of the objects returned in the connection. This is a convenience
   * field provided for quickly exploring the API; rather than querying for
   * "{ edges { node } }" when no edge data is needed, this field can be be used
   * instead. Note that when clients like Relay need to fetch the "cursor" field on
   * the edge to enable efficient pagination, this shortcut cannot be used, and the
   * full "{ edges { node } }" version should be used instead.
   */
  people?: Maybe<Array<Maybe<Person>>>;
  /**
   * A count of the total number of objects in this connection, ignoring pagination.
   * This allows a client to fetch the first five objects by passing "5" as the
   * argument to "first", then fetch the total count so it could display "5 of 83",
   * for example.
   */
  totalCount?: Maybe<Scalars['Int']>;
};

/** An edge in a connection. */
export type PeopleEdge = {
  __typename?: 'PeopleEdge';
  /** A cursor for use in pagination */
  cursor: Scalars['String'];
  /** The item at the end of the edge */
  node?: Maybe<Person>;
};

/** An individual person or character within the Star Wars universe. */
export type Person = Node & {
  __typename?: 'Person';
  /**
   * The birth year of the person, using the in-universe standard of BBY or ABY -
   * Before the Battle of Yavin or After the Battle of Yavin. The Battle of Yavin is
   * a battle that occurs at the end of Star Wars episode IV: A New Hope.
   */
  birthYear?: Maybe<Scalars['String']>;
  /** The ISO 8601 date format of the time that this resource was created. */
  created?: Maybe<Scalars['String']>;
  /** The ISO 8601 date format of the time that this resource was edited. */
  edited?: Maybe<Scalars['String']>;
  /**
   * The eye color of this person. Will be "unknown" if not known or "n/a" if the
   * person does not have an eye.
   */
  eyeColor?: Maybe<Scalars['String']>;
  filmConnection?: Maybe<PersonFilmsConnection>;
  /**
   * The gender of this person. Either "Male", "Female" or "unknown",
   * "n/a" if the person does not have a gender.
   */
  gender?: Maybe<Scalars['String']>;
  /**
   * The hair color of this person. Will be "unknown" if not known or "n/a" if the
   * person does not have hair.
   */
  hairColor?: Maybe<Scalars['String']>;
  /** The height of the person in centimeters. */
  height?: Maybe<Scalars['Int']>;
  /** A planet that this person was born on or inhabits. */
  homeworld?: Maybe<Planet>;
  /** The ID of an object */
  id: Scalars['ID'];
  /** The mass of the person in kilograms. */
  mass?: Maybe<Scalars['Float']>;
  /** The name of this person. */
  name?: Maybe<Scalars['String']>;
  /** The skin color of this person. */
  skinColor?: Maybe<Scalars['String']>;
  /** The species that this person belongs to, or null if unknown. */
  species?: Maybe<Species>;
  starshipConnection?: Maybe<PersonStarshipsConnection>;
  vehicleConnection?: Maybe<PersonVehiclesConnection>;
};

/** An individual person or character within the Star Wars universe. */
export type PersonFilmConnectionArgs = {
  after?: InputMaybe<Scalars['String']>;
  before?: InputMaybe<Scalars['String']>;
  first?: InputMaybe<Scalars['Int']>;
  last?: InputMaybe<Scalars['Int']>;
};

/** An individual person or character within the Star Wars universe. */
export type PersonStarshipConnectionArgs = {
  after?: InputMaybe<Scalars['String']>;
  before?: InputMaybe<Scalars['String']>;
  first?: InputMaybe<Scalars['Int']>;
  last?: InputMaybe<Scalars['Int']>;
};

/** An individual person or character within the Star Wars universe. */
export type PersonVehicleConnectionArgs = {
  after?: InputMaybe<Scalars['String']>;
  before?: InputMaybe<Scalars['String']>;
  first?: InputMaybe<Scalars['Int']>;
  last?: InputMaybe<Scalars['Int']>;
};

/** A connection to a list of items. */
export type PersonFilmsConnection = {
  __typename?: 'PersonFilmsConnection';
  /** A list of edges. */
  edges?: Maybe<Array<Maybe<PersonFilmsEdge>>>;
  /**
   * A list of all of the objects returned in the connection. This is a convenience
   * field provided for quickly exploring the API; rather than querying for
   * "{ edges { node } }" when no edge data is needed, this field can be be used
   * instead. Note that when clients like Relay need to fetch the "cursor" field on
   * the edge to enable efficient pagination, this shortcut cannot be used, and the
   * full "{ edges { node } }" version should be used instead.
   */
  films?: Maybe<Array<Maybe<Film>>>;
  /** Information to aid in pagination. */
  pageInfo: PageInfo;
  /**
   * A count of the total number of objects in this connection, ignoring pagination.
   * This allows a client to fetch the first five objects by passing "5" as the
   * argument to "first", then fetch the total count so it could display "5 of 83",
   * for example.
   */
  totalCount?: Maybe<Scalars['Int']>;
};

/** An edge in a connection. */
export type PersonFilmsEdge = {
  __typename?: 'PersonFilmsEdge';
  /** A cursor for use in pagination */
  cursor: Scalars['String'];
  /** The item at the end of the edge */
  node?: Maybe<Film>;
};

/** A connection to a list of items. */
export type PersonStarshipsConnection = {
  __typename?: 'PersonStarshipsConnection';
  /** A list of edges. */
  edges?: Maybe<Array<Maybe<PersonStarshipsEdge>>>;
  /** Information to aid in pagination. */
  pageInfo: PageInfo;
  /**
   * A list of all of the objects returned in the connection. This is a convenience
   * field provided for quickly exploring the API; rather than querying for
   * "{ edges { node } }" when no edge data is needed, this field can be be used
   * instead. Note that when clients like Relay need to fetch the "cursor" field on
   * the edge to enable efficient pagination, this shortcut cannot be used, and the
   * full "{ edges { node } }" version should be used instead.
   */
  starships?: Maybe<Array<Maybe<Starship>>>;
  /**
   * A count of the total number of objects in this connection, ignoring pagination.
   * This allows a client to fetch the first five objects by passing "5" as the
   * argument to "first", then fetch the total count so it could display "5 of 83",
   * for example.
   */
  totalCount?: Maybe<Scalars['Int']>;
};

/** An edge in a connection. */
export type PersonStarshipsEdge = {
  __typename?: 'PersonStarshipsEdge';
  /** A cursor for use in pagination */
  cursor: Scalars['String'];
  /** The item at the end of the edge */
  node?: Maybe<Starship>;
};

/** A connection to a list of items. */
export type PersonVehiclesConnection = {
  __typename?: 'PersonVehiclesConnection';
  /** A list of edges. */
  edges?: Maybe<Array<Maybe<PersonVehiclesEdge>>>;
  /** Information to aid in pagination. */
  pageInfo: PageInfo;
  /**
   * A count of the total number of objects in this connection, ignoring pagination.
   * This allows a client to fetch the first five objects by passing "5" as the
   * argument to "first", then fetch the total count so it could display "5 of 83",
   * for example.
   */
  totalCount?: Maybe<Scalars['Int']>;
  /**
   * A list of all of the objects returned in the connection. This is a convenience
   * field provided for quickly exploring the API; rather than querying for
   * "{ edges { node } }" when no edge data is needed, this field can be be used
   * instead. Note that when clients like Relay need to fetch the "cursor" field on
   * the edge to enable efficient pagination, this shortcut cannot be used, and the
   * full "{ edges { node } }" version should be used instead.
   */
  vehicles?: Maybe<Array<Maybe<Vehicle>>>;
};

/** An edge in a connection. */
export type PersonVehiclesEdge = {
  __typename?: 'PersonVehiclesEdge';
  /** A cursor for use in pagination */
  cursor: Scalars['String'];
  /** The item at the end of the edge */
  node?: Maybe<Vehicle>;
};

/**
 * A large mass, planet or planetoid in the Star Wars Universe, at the time of
 * 0 ABY.
 */
export type Planet = Node & {
  __typename?: 'Planet';
  /** The climates of this planet. */
  climates?: Maybe<Array<Maybe<Scalars['String']>>>;
  /** The ISO 8601 date format of the time that this resource was created. */
  created?: Maybe<Scalars['String']>;
  /** The diameter of this planet in kilometers. */
  diameter?: Maybe<Scalars['Int']>;
  /** The ISO 8601 date format of the time that this resource was edited. */
  edited?: Maybe<Scalars['String']>;
  filmConnection?: Maybe<PlanetFilmsConnection>;
  /**
   * A number denoting the gravity of this planet, where "1" is normal or 1 standard
   * G. "2" is twice or 2 standard Gs. "0.5" is half or 0.5 standard Gs.
   */
  gravity?: Maybe<Scalars['String']>;
  /** The ID of an object */
  id: Scalars['ID'];
  /** The name of this planet. */
  name?: Maybe<Scalars['String']>;
  /**
   * The number of standard days it takes for this planet to complete a single orbit
   * of its local star.
   */
  orbitalPeriod?: Maybe<Scalars['Int']>;
  /** The average population of sentient beings inhabiting this planet. */
  population?: Maybe<Scalars['Float']>;
  residentConnection?: Maybe<PlanetResidentsConnection>;
  /**
   * The number of standard hours it takes for this planet to complete a single
   * rotation on its axis.
   */
  rotationPeriod?: Maybe<Scalars['Int']>;
  /**
   * The percentage of the planet surface that is naturally occurring water or bodies
   * of water.
   */
  surfaceWater?: Maybe<Scalars['Float']>;
  /** The terrains of this planet. */
  terrains?: Maybe<Array<Maybe<Scalars['String']>>>;
};

/**
 * A large mass, planet or planetoid in the Star Wars Universe, at the time of
 * 0 ABY.
 */
export type PlanetFilmConnectionArgs = {
  after?: InputMaybe<Scalars['String']>;
  before?: InputMaybe<Scalars['String']>;
  first?: InputMaybe<Scalars['Int']>;
  last?: InputMaybe<Scalars['Int']>;
};

/**
 * A large mass, planet or planetoid in the Star Wars Universe, at the time of
 * 0 ABY.
 */
export type PlanetResidentConnectionArgs = {
  after?: InputMaybe<Scalars['String']>;
  before?: InputMaybe<Scalars['String']>;
  first?: InputMaybe<Scalars['Int']>;
  last?: InputMaybe<Scalars['Int']>;
};

/** A connection to a list of items. */
export type PlanetFilmsConnection = {
  __typename?: 'PlanetFilmsConnection';
  /** A list of edges. */
  edges?: Maybe<Array<Maybe<PlanetFilmsEdge>>>;
  /**
   * A list of all of the objects returned in the connection. This is a convenience
   * field provided for quickly exploring the API; rather than querying for
   * "{ edges { node } }" when no edge data is needed, this field can be be used
   * instead. Note that when clients like Relay need to fetch the "cursor" field on
   * the edge to enable efficient pagination, this shortcut cannot be used, and the
   * full "{ edges { node } }" version should be used instead.
   */
  films?: Maybe<Array<Maybe<Film>>>;
  /** Information to aid in pagination. */
  pageInfo: PageInfo;
  /**
   * A count of the total number of objects in this connection, ignoring pagination.
   * This allows a client to fetch the first five objects by passing "5" as the
   * argument to "first", then fetch the total count so it could display "5 of 83",
   * for example.
   */
  totalCount?: Maybe<Scalars['Int']>;
};

/** An edge in a connection. */
export type PlanetFilmsEdge = {
  __typename?: 'PlanetFilmsEdge';
  /** A cursor for use in pagination */
  cursor: Scalars['String'];
  /** The item at the end of the edge */
  node?: Maybe<Film>;
};

/** A connection to a list of items. */
export type PlanetResidentsConnection = {
  __typename?: 'PlanetResidentsConnection';
  /** A list of edges. */
  edges?: Maybe<Array<Maybe<PlanetResidentsEdge>>>;
  /** Information to aid in pagination. */
  pageInfo: PageInfo;
  /**
   * A list of all of the objects returned in the connection. This is a convenience
   * field provided for quickly exploring the API; rather than querying for
   * "{ edges { node } }" when no edge data is needed, this field can be be used
   * instead. Note that when clients like Relay need to fetch the "cursor" field on
   * the edge to enable efficient pagination, this shortcut cannot be used, and the
   * full "{ edges { node } }" version should be used instead.
   */
  residents?: Maybe<Array<Maybe<Person>>>;
  /**
   * A count of the total number of objects in this connection, ignoring pagination.
   * This allows a client to fetch the first five objects by passing "5" as the
   * argument to "first", then fetch the total count so it could display "5 of 83",
   * for example.
   */
  totalCount?: Maybe<Scalars['Int']>;
};

/** An edge in a connection. */
export type PlanetResidentsEdge = {
  __typename?: 'PlanetResidentsEdge';
  /** A cursor for use in pagination */
  cursor: Scalars['String'];
  /** The item at the end of the edge */
  node?: Maybe<Person>;
};

/** A connection to a list of items. */
export type PlanetsConnection = {
  __typename?: 'PlanetsConnection';
  /** A list of edges. */
  edges?: Maybe<Array<Maybe<PlanetsEdge>>>;
  /** Information to aid in pagination. */
  pageInfo: PageInfo;
  /**
   * A list of all of the objects returned in the connection. This is a convenience
   * field provided for quickly exploring the API; rather than querying for
   * "{ edges { node } }" when no edge data is needed, this field can be be used
   * instead. Note that when clients like Relay need to fetch the "cursor" field on
   * the edge to enable efficient pagination, this shortcut cannot be used, and the
   * full "{ edges { node } }" version should be used instead.
   */
  planets?: Maybe<Array<Maybe<Planet>>>;
  /**
   * A count of the total number of objects in this connection, ignoring pagination.
   * This allows a client to fetch the first five objects by passing "5" as the
   * argument to "first", then fetch the total count so it could display "5 of 83",
   * for example.
   */
  totalCount?: Maybe<Scalars['Int']>;
};

/** An edge in a connection. */
export type PlanetsEdge = {
  __typename?: 'PlanetsEdge';
  /** A cursor for use in pagination */
  cursor: Scalars['String'];
  /** The item at the end of the edge */
  node?: Maybe<Planet>;
};

export type Root = {
  __typename?: 'Root';
  allFilms?: Maybe<FilmsConnection>;
  allPeople?: Maybe<PeopleConnection>;
  allPlanets?: Maybe<PlanetsConnection>;
  allSpecies?: Maybe<SpeciesConnection>;
  allStarships?: Maybe<StarshipsConnection>;
  allVehicles?: Maybe<VehiclesConnection>;
  film?: Maybe<Film>;
  /** Fetches an object given its ID */
  node?: Maybe<Node>;
  person?: Maybe<Person>;
  planet?: Maybe<Planet>;
  species?: Maybe<Species>;
  starship?: Maybe<Starship>;
  vehicle?: Maybe<Vehicle>;
};

export type RootAllFilmsArgs = {
  after?: InputMaybe<Scalars['String']>;
  before?: InputMaybe<Scalars['String']>;
  first?: InputMaybe<Scalars['Int']>;
  last?: InputMaybe<Scalars['Int']>;
};

export type RootAllPeopleArgs = {
  after?: InputMaybe<Scalars['String']>;
  before?: InputMaybe<Scalars['String']>;
  first?: InputMaybe<Scalars['Int']>;
  last?: InputMaybe<Scalars['Int']>;
};

export type RootAllPlanetsArgs = {
  after?: InputMaybe<Scalars['String']>;
  before?: InputMaybe<Scalars['String']>;
  first?: InputMaybe<Scalars['Int']>;
  last?: InputMaybe<Scalars['Int']>;
};

export type RootAllSpeciesArgs = {
  after?: InputMaybe<Scalars['String']>;
  before?: InputMaybe<Scalars['String']>;
  first?: InputMaybe<Scalars['Int']>;
  last?: InputMaybe<Scalars['Int']>;
};

export type RootAllStarshipsArgs = {
  after?: InputMaybe<Scalars['String']>;
  before?: InputMaybe<Scalars['String']>;
  first?: InputMaybe<Scalars['Int']>;
  last?: InputMaybe<Scalars['Int']>;
};

export type RootAllVehiclesArgs = {
  after?: InputMaybe<Scalars['String']>;
  before?: InputMaybe<Scalars['String']>;
  first?: InputMaybe<Scalars['Int']>;
  last?: InputMaybe<Scalars['Int']>;
};

export type RootFilmArgs = {
  filmID?: InputMaybe<Scalars['ID']>;
  id?: InputMaybe<Scalars['ID']>;
};

export type RootNodeArgs = {
  id: Scalars['ID'];
};

export type RootPersonArgs = {
  id?: InputMaybe<Scalars['ID']>;
  personID?: InputMaybe<Scalars['ID']>;
};

export type RootPlanetArgs = {
  id?: InputMaybe<Scalars['ID']>;
  planetID?: InputMaybe<Scalars['ID']>;
};

export type RootSpeciesArgs = {
  id?: InputMaybe<Scalars['ID']>;
  speciesID?: InputMaybe<Scalars['ID']>;
};

export type RootStarshipArgs = {
  id?: InputMaybe<Scalars['ID']>;
  starshipID?: InputMaybe<Scalars['ID']>;
};

export type RootVehicleArgs = {
  id?: InputMaybe<Scalars['ID']>;
  vehicleID?: InputMaybe<Scalars['ID']>;
};

/** A type of person or character within the Star Wars Universe. */
export type Species = Node & {
  __typename?: 'Species';
  /** The average height of this species in centimeters. */
  averageHeight?: Maybe<Scalars['Float']>;
  /** The average lifespan of this species in years, null if unknown. */
  averageLifespan?: Maybe<Scalars['Int']>;
  /** The classification of this species, such as "mammal" or "reptile". */
  classification?: Maybe<Scalars['String']>;
  /** The ISO 8601 date format of the time that this resource was created. */
  created?: Maybe<Scalars['String']>;
  /** The designation of this species, such as "sentient". */
  designation?: Maybe<Scalars['String']>;
  /** The ISO 8601 date format of the time that this resource was edited. */
  edited?: Maybe<Scalars['String']>;
  /**
   * Common eye colors for this species, null if this species does not typically
   * have eyes.
   */
  eyeColors?: Maybe<Array<Maybe<Scalars['String']>>>;
  filmConnection?: Maybe<SpeciesFilmsConnection>;
  /**
   * Common hair colors for this species, null if this species does not typically
   * have hair.
   */
  hairColors?: Maybe<Array<Maybe<Scalars['String']>>>;
  /** A planet that this species originates from. */
  homeworld?: Maybe<Planet>;
  /** The ID of an object */
  id: Scalars['ID'];
  /** The language commonly spoken by this species. */
  language?: Maybe<Scalars['String']>;
  /** The name of this species. */
  name?: Maybe<Scalars['String']>;
  personConnection?: Maybe<SpeciesPeopleConnection>;
  /**
   * Common skin colors for this species, null if this species does not typically
   * have skin.
   */
  skinColors?: Maybe<Array<Maybe<Scalars['String']>>>;
};

/** A type of person or character within the Star Wars Universe. */
export type SpeciesFilmConnectionArgs = {
  after?: InputMaybe<Scalars['String']>;
  before?: InputMaybe<Scalars['String']>;
  first?: InputMaybe<Scalars['Int']>;
  last?: InputMaybe<Scalars['Int']>;
};

/** A type of person or character within the Star Wars Universe. */
export type SpeciesPersonConnectionArgs = {
  after?: InputMaybe<Scalars['String']>;
  before?: InputMaybe<Scalars['String']>;
  first?: InputMaybe<Scalars['Int']>;
  last?: InputMaybe<Scalars['Int']>;
};

/** A connection to a list of items. */
export type SpeciesConnection = {
  __typename?: 'SpeciesConnection';
  /** A list of edges. */
  edges?: Maybe<Array<Maybe<SpeciesEdge>>>;
  /** Information to aid in pagination. */
  pageInfo: PageInfo;
  /**
   * A list of all of the objects returned in the connection. This is a convenience
   * field provided for quickly exploring the API; rather than querying for
   * "{ edges { node } }" when no edge data is needed, this field can be be used
   * instead. Note that when clients like Relay need to fetch the "cursor" field on
   * the edge to enable efficient pagination, this shortcut cannot be used, and the
   * full "{ edges { node } }" version should be used instead.
   */
  species?: Maybe<Array<Maybe<Species>>>;
  /**
   * A count of the total number of objects in this connection, ignoring pagination.
   * This allows a client to fetch the first five objects by passing "5" as the
   * argument to "first", then fetch the total count so it could display "5 of 83",
   * for example.
   */
  totalCount?: Maybe<Scalars['Int']>;
};

/** An edge in a connection. */
export type SpeciesEdge = {
  __typename?: 'SpeciesEdge';
  /** A cursor for use in pagination */
  cursor: Scalars['String'];
  /** The item at the end of the edge */
  node?: Maybe<Species>;
};

/** A connection to a list of items. */
export type SpeciesFilmsConnection = {
  __typename?: 'SpeciesFilmsConnection';
  /** A list of edges. */
  edges?: Maybe<Array<Maybe<SpeciesFilmsEdge>>>;
  /**
   * A list of all of the objects returned in the connection. This is a convenience
   * field provided for quickly exploring the API; rather than querying for
   * "{ edges { node } }" when no edge data is needed, this field can be be used
   * instead. Note that when clients like Relay need to fetch the "cursor" field on
   * the edge to enable efficient pagination, this shortcut cannot be used, and the
   * full "{ edges { node } }" version should be used instead.
   */
  films?: Maybe<Array<Maybe<Film>>>;
  /** Information to aid in pagination. */
  pageInfo: PageInfo;
  /**
   * A count of the total number of objects in this connection, ignoring pagination.
   * This allows a client to fetch the first five objects by passing "5" as the
   * argument to "first", then fetch the total count so it could display "5 of 83",
   * for example.
   */
  totalCount?: Maybe<Scalars['Int']>;
};

/** An edge in a connection. */
export type SpeciesFilmsEdge = {
  __typename?: 'SpeciesFilmsEdge';
  /** A cursor for use in pagination */
  cursor: Scalars['String'];
  /** The item at the end of the edge */
  node?: Maybe<Film>;
};

/** A connection to a list of items. */
export type SpeciesPeopleConnection = {
  __typename?: 'SpeciesPeopleConnection';
  /** A list of edges. */
  edges?: Maybe<Array<Maybe<SpeciesPeopleEdge>>>;
  /** Information to aid in pagination. */
  pageInfo: PageInfo;
  /**
   * A list of all of the objects returned in the connection. This is a convenience
   * field provided for quickly exploring the API; rather than querying for
   * "{ edges { node } }" when no edge data is needed, this field can be be used
   * instead. Note that when clients like Relay need to fetch the "cursor" field on
   * the edge to enable efficient pagination, this shortcut cannot be used, and the
   * full "{ edges { node } }" version should be used instead.
   */
  people?: Maybe<Array<Maybe<Person>>>;
  /**
   * A count of the total number of objects in this connection, ignoring pagination.
   * This allows a client to fetch the first five objects by passing "5" as the
   * argument to "first", then fetch the total count so it could display "5 of 83",
   * for example.
   */
  totalCount?: Maybe<Scalars['Int']>;
};

/** An edge in a connection. */
export type SpeciesPeopleEdge = {
  __typename?: 'SpeciesPeopleEdge';
  /** A cursor for use in pagination */
  cursor: Scalars['String'];
  /** The item at the end of the edge */
  node?: Maybe<Person>;
};

/** A single transport craft that has hyperdrive capability. */
export type Starship = Node & {
  __typename?: 'Starship';
  /**
   * The Maximum number of Megalights this starship can travel in a standard hour.
   * A "Megalight" is a standard unit of distance and has never been defined before
   * within the Star Wars universe. This figure is only really useful for measuring
   * the difference in speed of starships. We can assume it is similar to AU, the
   * distance between our Sun (Sol) and Earth.
   */
  MGLT?: Maybe<Scalars['Int']>;
  /** The maximum number of kilograms that this starship can transport. */
  cargoCapacity?: Maybe<Scalars['Float']>;
  /**
   * The maximum length of time that this starship can provide consumables for its
   * entire crew without having to resupply.
   */
  consumables?: Maybe<Scalars['String']>;
  /** The cost of this starship new, in galactic credits. */
  costInCredits?: Maybe<Scalars['Float']>;
  /** The ISO 8601 date format of the time that this resource was created. */
  created?: Maybe<Scalars['String']>;
  /** The number of personnel needed to run or pilot this starship. */
  crew?: Maybe<Scalars['String']>;
  /** The ISO 8601 date format of the time that this resource was edited. */
  edited?: Maybe<Scalars['String']>;
  filmConnection?: Maybe<StarshipFilmsConnection>;
  /** The class of this starships hyperdrive. */
  hyperdriveRating?: Maybe<Scalars['Float']>;
  /** The ID of an object */
  id: Scalars['ID'];
  /** The length of this starship in meters. */
  length?: Maybe<Scalars['Float']>;
  /** The manufacturers of this starship. */
  manufacturers?: Maybe<Array<Maybe<Scalars['String']>>>;
  /**
   * The maximum speed of this starship in atmosphere. null if this starship is
   * incapable of atmosphering flight.
   */
  maxAtmospheringSpeed?: Maybe<Scalars['Int']>;
  /**
   * The model or official name of this starship. Such as "T-65 X-wing" or "DS-1
   * Orbital Battle Station".
   */
  model?: Maybe<Scalars['String']>;
  /** The name of this starship. The common name, such as "Death Star". */
  name?: Maybe<Scalars['String']>;
  /** The number of non-essential people this starship can transport. */
  passengers?: Maybe<Scalars['String']>;
  pilotConnection?: Maybe<StarshipPilotsConnection>;
  /**
   * The class of this starship, such as "Starfighter" or "Deep Space Mobile
   * Battlestation"
   */
  starshipClass?: Maybe<Scalars['String']>;
};

/** A single transport craft that has hyperdrive capability. */
export type StarshipFilmConnectionArgs = {
  after?: InputMaybe<Scalars['String']>;
  before?: InputMaybe<Scalars['String']>;
  first?: InputMaybe<Scalars['Int']>;
  last?: InputMaybe<Scalars['Int']>;
};

/** A single transport craft that has hyperdrive capability. */
export type StarshipPilotConnectionArgs = {
  after?: InputMaybe<Scalars['String']>;
  before?: InputMaybe<Scalars['String']>;
  first?: InputMaybe<Scalars['Int']>;
  last?: InputMaybe<Scalars['Int']>;
};

/** A connection to a list of items. */
export type StarshipFilmsConnection = {
  __typename?: 'StarshipFilmsConnection';
  /** A list of edges. */
  edges?: Maybe<Array<Maybe<StarshipFilmsEdge>>>;
  /**
   * A list of all of the objects returned in the connection. This is a convenience
   * field provided for quickly exploring the API; rather than querying for
   * "{ edges { node } }" when no edge data is needed, this field can be be used
   * instead. Note that when clients like Relay need to fetch the "cursor" field on
   * the edge to enable efficient pagination, this shortcut cannot be used, and the
   * full "{ edges { node } }" version should be used instead.
   */
  films?: Maybe<Array<Maybe<Film>>>;
  /** Information to aid in pagination. */
  pageInfo: PageInfo;
  /**
   * A count of the total number of objects in this connection, ignoring pagination.
   * This allows a client to fetch the first five objects by passing "5" as the
   * argument to "first", then fetch the total count so it could display "5 of 83",
   * for example.
   */
  totalCount?: Maybe<Scalars['Int']>;
};

/** An edge in a connection. */
export type StarshipFilmsEdge = {
  __typename?: 'StarshipFilmsEdge';
  /** A cursor for use in pagination */
  cursor: Scalars['String'];
  /** The item at the end of the edge */
  node?: Maybe<Film>;
};

/** A connection to a list of items. */
export type StarshipPilotsConnection = {
  __typename?: 'StarshipPilotsConnection';
  /** A list of edges. */
  edges?: Maybe<Array<Maybe<StarshipPilotsEdge>>>;
  /** Information to aid in pagination. */
  pageInfo: PageInfo;
  /**
   * A list of all of the objects returned in the connection. This is a convenience
   * field provided for quickly exploring the API; rather than querying for
   * "{ edges { node } }" when no edge data is needed, this field can be be used
   * instead. Note that when clients like Relay need to fetch the "cursor" field on
   * the edge to enable efficient pagination, this shortcut cannot be used, and the
   * full "{ edges { node } }" version should be used instead.
   */
  pilots?: Maybe<Array<Maybe<Person>>>;
  /**
   * A count of the total number of objects in this connection, ignoring pagination.
   * This allows a client to fetch the first five objects by passing "5" as the
   * argument to "first", then fetch the total count so it could display "5 of 83",
   * for example.
   */
  totalCount?: Maybe<Scalars['Int']>;
};

/** An edge in a connection. */
export type StarshipPilotsEdge = {
  __typename?: 'StarshipPilotsEdge';
  /** A cursor for use in pagination */
  cursor: Scalars['String'];
  /** The item at the end of the edge */
  node?: Maybe<Person>;
};

/** A connection to a list of items. */
export type StarshipsConnection = {
  __typename?: 'StarshipsConnection';
  /** A list of edges. */
  edges?: Maybe<Array<Maybe<StarshipsEdge>>>;
  /** Information to aid in pagination. */
  pageInfo: PageInfo;
  /**
   * A list of all of the objects returned in the connection. This is a convenience
   * field provided for quickly exploring the API; rather than querying for
   * "{ edges { node } }" when no edge data is needed, this field can be be used
   * instead. Note that when clients like Relay need to fetch the "cursor" field on
   * the edge to enable efficient pagination, this shortcut cannot be used, and the
   * full "{ edges { node } }" version should be used instead.
   */
  starships?: Maybe<Array<Maybe<Starship>>>;
  /**
   * A count of the total number of objects in this connection, ignoring pagination.
   * This allows a client to fetch the first five objects by passing "5" as the
   * argument to "first", then fetch the total count so it could display "5 of 83",
   * for example.
   */
  totalCount?: Maybe<Scalars['Int']>;
};

/** An edge in a connection. */
export type StarshipsEdge = {
  __typename?: 'StarshipsEdge';
  /** A cursor for use in pagination */
  cursor: Scalars['String'];
  /** The item at the end of the edge */
  node?: Maybe<Starship>;
};

/** A single transport craft that does not have hyperdrive capability */
export type Vehicle = Node & {
  __typename?: 'Vehicle';
  /** The maximum number of kilograms that this vehicle can transport. */
  cargoCapacity?: Maybe<Scalars['Float']>;
  /**
   * The maximum length of time that this vehicle can provide consumables for its
   * entire crew without having to resupply.
   */
  consumables?: Maybe<Scalars['String']>;
  /** The cost of this vehicle new, in Galactic Credits. */
  costInCredits?: Maybe<Scalars['Float']>;
  /** The ISO 8601 date format of the time that this resource was created. */
  created?: Maybe<Scalars['String']>;
  /** The number of personnel needed to run or pilot this vehicle. */
  crew?: Maybe<Scalars['String']>;
  /** The ISO 8601 date format of the time that this resource was edited. */
  edited?: Maybe<Scalars['String']>;
  filmConnection?: Maybe<VehicleFilmsConnection>;
  /** The ID of an object */
  id: Scalars['ID'];
  /** The length of this vehicle in meters. */
  length?: Maybe<Scalars['Float']>;
  /** The manufacturers of this vehicle. */
  manufacturers?: Maybe<Array<Maybe<Scalars['String']>>>;
  /** The maximum speed of this vehicle in atmosphere. */
  maxAtmospheringSpeed?: Maybe<Scalars['Int']>;
  /**
   * The model or official name of this vehicle. Such as "All-Terrain Attack
   * Transport".
   */
  model?: Maybe<Scalars['String']>;
  /**
   * The name of this vehicle. The common name, such as "Sand Crawler" or "Speeder
   * bike".
   */
  name?: Maybe<Scalars['String']>;
  /** The number of non-essential people this vehicle can transport. */
  passengers?: Maybe<Scalars['String']>;
  pilotConnection?: Maybe<VehiclePilotsConnection>;
  /** The class of this vehicle, such as "Wheeled" or "Repulsorcraft". */
  vehicleClass?: Maybe<Scalars['String']>;
};

/** A single transport craft that does not have hyperdrive capability */
export type VehicleFilmConnectionArgs = {
  after?: InputMaybe<Scalars['String']>;
  before?: InputMaybe<Scalars['String']>;
  first?: InputMaybe<Scalars['Int']>;
  last?: InputMaybe<Scalars['Int']>;
};

/** A single transport craft that does not have hyperdrive capability */
export type VehiclePilotConnectionArgs = {
  after?: InputMaybe<Scalars['String']>;
  before?: InputMaybe<Scalars['String']>;
  first?: InputMaybe<Scalars['Int']>;
  last?: InputMaybe<Scalars['Int']>;
};

/** A connection to a list of items. */
export type VehicleFilmsConnection = {
  __typename?: 'VehicleFilmsConnection';
  /** A list of edges. */
  edges?: Maybe<Array<Maybe<VehicleFilmsEdge>>>;
  /**
   * A list of all of the objects returned in the connection. This is a convenience
   * field provided for quickly exploring the API; rather than querying for
   * "{ edges { node } }" when no edge data is needed, this field can be be used
   * instead. Note that when clients like Relay need to fetch the "cursor" field on
   * the edge to enable efficient pagination, this shortcut cannot be used, and the
   * full "{ edges { node } }" version should be used instead.
   */
  films?: Maybe<Array<Maybe<Film>>>;
  /** Information to aid in pagination. */
  pageInfo: PageInfo;
  /**
   * A count of the total number of objects in this connection, ignoring pagination.
   * This allows a client to fetch the first five objects by passing "5" as the
   * argument to "first", then fetch the total count so it could display "5 of 83",
   * for example.
   */
  totalCount?: Maybe<Scalars['Int']>;
};

/** An edge in a connection. */
export type VehicleFilmsEdge = {
  __typename?: 'VehicleFilmsEdge';
  /** A cursor for use in pagination */
  cursor: Scalars['String'];
  /** The item at the end of the edge */
  node?: Maybe<Film>;
};

/** A connection to a list of items. */
export type VehiclePilotsConnection = {
  __typename?: 'VehiclePilotsConnection';
  /** A list of edges. */
  edges?: Maybe<Array<Maybe<VehiclePilotsEdge>>>;
  /** Information to aid in pagination. */
  pageInfo: PageInfo;
  /**
   * A list of all of the objects returned in the connection. This is a convenience
   * field provided for quickly exploring the API; rather than querying for
   * "{ edges { node } }" when no edge data is needed, this field can be be used
   * instead. Note that when clients like Relay need to fetch the "cursor" field on
   * the edge to enable efficient pagination, this shortcut cannot be used, and the
   * full "{ edges { node } }" version should be used instead.
   */
  pilots?: Maybe<Array<Maybe<Person>>>;
  /**
   * A count of the total number of objects in this connection, ignoring pagination.
   * This allows a client to fetch the first five objects by passing "5" as the
   * argument to "first", then fetch the total count so it could display "5 of 83",
   * for example.
   */
  totalCount?: Maybe<Scalars['Int']>;
};

/** An edge in a connection. */
export type VehiclePilotsEdge = {
  __typename?: 'VehiclePilotsEdge';
  /** A cursor for use in pagination */
  cursor: Scalars['String'];
  /** The item at the end of the edge */
  node?: Maybe<Person>;
};

/** A connection to a list of items. */
export type VehiclesConnection = {
  __typename?: 'VehiclesConnection';
  /** A list of edges. */
  edges?: Maybe<Array<Maybe<VehiclesEdge>>>;
  /** Information to aid in pagination. */
  pageInfo: PageInfo;
  /**
   * A count of the total number of objects in this connection, ignoring pagination.
   * This allows a client to fetch the first five objects by passing "5" as the
   * argument to "first", then fetch the total count so it could display "5 of 83",
   * for example.
   */
  totalCount?: Maybe<Scalars['Int']>;
  /**
   * A list of all of the objects returned in the connection. This is a convenience
   * field provided for quickly exploring the API; rather than querying for
   * "{ edges { node } }" when no edge data is needed, this field can be be used
   * instead. Note that when clients like Relay need to fetch the "cursor" field on
   * the edge to enable efficient pagination, this shortcut cannot be used, and the
   * full "{ edges { node } }" version should be used instead.
   */
  vehicles?: Maybe<Array<Maybe<Vehicle>>>;
};

/** An edge in a connection. */
export type VehiclesEdge = {
  __typename?: 'VehiclesEdge';
  /** A cursor for use in pagination */
  cursor: Scalars['String'];
  /** The item at the end of the edge */
  node?: Maybe<Vehicle>;
};

export type ResolverTypeWrapper<T> = Promise<T> | T;

export type ResolverWithResolve<TResult, TParent, TContext, TArgs> = {
  resolve: ResolverFn<TResult, TParent, TContext, TArgs>;
};
export type Resolver<TResult, TParent = {}, TContext = {}, TArgs = {}> =
  | ResolverFn<TResult, TParent, TContext, TArgs>
  | ResolverWithResolve<TResult, TParent, TContext, TArgs>;

export type ResolverFn<TResult, TParent, TContext, TArgs> = (
  parent: TParent,
  args: TArgs,
  context: TContext,
  info: GraphQLResolveInfo
) => Promise<TResult> | TResult;

export type SubscriptionSubscribeFn<TResult, TParent, TContext, TArgs> = (
  parent: TParent,
  args: TArgs,
  context: TContext,
  info: GraphQLResolveInfo
) => AsyncIterable<TResult> | Promise<AsyncIterable<TResult>>;

export type SubscriptionResolveFn<TResult, TParent, TContext, TArgs> = (
  parent: TParent,
  args: TArgs,
  context: TContext,
  info: GraphQLResolveInfo
) => TResult | Promise<TResult>;

export interface SubscriptionSubscriberObject<TResult, TKey extends string, TParent, TContext, TArgs> {
  subscribe: SubscriptionSubscribeFn<{ [key in TKey]: TResult }, TParent, TContext, TArgs>;
  resolve?: SubscriptionResolveFn<TResult, { [key in TKey]: TResult }, TContext, TArgs>;
}

export interface SubscriptionResolverObject<TResult, TParent, TContext, TArgs> {
  subscribe: SubscriptionSubscribeFn<any, TParent, TContext, TArgs>;
  resolve: SubscriptionResolveFn<TResult, any, TContext, TArgs>;
}

export type SubscriptionObject<TResult, TKey extends string, TParent, TContext, TArgs> =
  | SubscriptionSubscriberObject<TResult, TKey, TParent, TContext, TArgs>
  | SubscriptionResolverObject<TResult, TParent, TContext, TArgs>;

export type SubscriptionResolver<TResult, TKey extends string, TParent = {}, TContext = {}, TArgs = {}> =
  | ((...args: any[]) => SubscriptionObject<TResult, TKey, TParent, TContext, TArgs>)
  | SubscriptionObject<TResult, TKey, TParent, TContext, TArgs>;

export type TypeResolveFn<TTypes, TParent = {}, TContext = {}> = (
  parent: TParent,
  context: TContext,
  info: GraphQLResolveInfo
) => Maybe<TTypes> | Promise<Maybe<TTypes>>;

export type IsTypeOfResolverFn<T = {}, TContext = {}> = (
  obj: T,
  context: TContext,
  info: GraphQLResolveInfo
) => boolean | Promise<boolean>;

export type NextResolverFn<T> = () => Promise<T>;

export type DirectiveResolverFn<TResult = {}, TParent = {}, TContext = {}, TArgs = {}> = (
  next: NextResolverFn<TResult>,
  parent: TParent,
  args: TArgs,
  context: TContext,
  info: GraphQLResolveInfo
) => TResult | Promise<TResult>;

/** Mapping between all available schema types and the resolvers types */
export type ResolversTypes = {
  Boolean: ResolverTypeWrapper<Scalars['Boolean']>;
  Film: ResolverTypeWrapper<Film>;
  FilmCharactersConnection: ResolverTypeWrapper<FilmCharactersConnection>;
  FilmCharactersEdge: ResolverTypeWrapper<FilmCharactersEdge>;
  FilmPlanetsConnection: ResolverTypeWrapper<FilmPlanetsConnection>;
  FilmPlanetsEdge: ResolverTypeWrapper<FilmPlanetsEdge>;
  FilmSpeciesConnection: ResolverTypeWrapper<FilmSpeciesConnection>;
  FilmSpeciesEdge: ResolverTypeWrapper<FilmSpeciesEdge>;
  FilmStarshipsConnection: ResolverTypeWrapper<FilmStarshipsConnection>;
  FilmStarshipsEdge: ResolverTypeWrapper<FilmStarshipsEdge>;
  FilmVehiclesConnection: ResolverTypeWrapper<FilmVehiclesConnection>;
  FilmVehiclesEdge: ResolverTypeWrapper<FilmVehiclesEdge>;
  FilmsConnection: ResolverTypeWrapper<FilmsConnection>;
  FilmsEdge: ResolverTypeWrapper<FilmsEdge>;
  Float: ResolverTypeWrapper<Scalars['Float']>;
  ID: ResolverTypeWrapper<Scalars['ID']>;
  Int: ResolverTypeWrapper<Scalars['Int']>;
  Node:
    | ResolversTypes['Film']
    | ResolversTypes['Person']
    | ResolversTypes['Planet']
    | ResolversTypes['Species']
    | ResolversTypes['Starship']
    | ResolversTypes['Vehicle'];
  PageInfo: ResolverTypeWrapper<PageInfo>;
  PeopleConnection: ResolverTypeWrapper<PeopleConnection>;
  PeopleEdge: ResolverTypeWrapper<PeopleEdge>;
  Person: ResolverTypeWrapper<Person>;
  PersonFilmsConnection: ResolverTypeWrapper<PersonFilmsConnection>;
  PersonFilmsEdge: ResolverTypeWrapper<PersonFilmsEdge>;
  PersonStarshipsConnection: ResolverTypeWrapper<PersonStarshipsConnection>;
  PersonStarshipsEdge: ResolverTypeWrapper<PersonStarshipsEdge>;
  PersonVehiclesConnection: ResolverTypeWrapper<PersonVehiclesConnection>;
  PersonVehiclesEdge: ResolverTypeWrapper<PersonVehiclesEdge>;
  Planet: ResolverTypeWrapper<Planet>;
  PlanetFilmsConnection: ResolverTypeWrapper<PlanetFilmsConnection>;
  PlanetFilmsEdge: ResolverTypeWrapper<PlanetFilmsEdge>;
  PlanetResidentsConnection: ResolverTypeWrapper<PlanetResidentsConnection>;
  PlanetResidentsEdge: ResolverTypeWrapper<PlanetResidentsEdge>;
  PlanetsConnection: ResolverTypeWrapper<PlanetsConnection>;
  PlanetsEdge: ResolverTypeWrapper<PlanetsEdge>;
  Root: ResolverTypeWrapper<{}>;
  Species: ResolverTypeWrapper<Species>;
  SpeciesConnection: ResolverTypeWrapper<SpeciesConnection>;
  SpeciesEdge: ResolverTypeWrapper<SpeciesEdge>;
  SpeciesFilmsConnection: ResolverTypeWrapper<SpeciesFilmsConnection>;
  SpeciesFilmsEdge: ResolverTypeWrapper<SpeciesFilmsEdge>;
  SpeciesPeopleConnection: ResolverTypeWrapper<SpeciesPeopleConnection>;
  SpeciesPeopleEdge: ResolverTypeWrapper<SpeciesPeopleEdge>;
  Starship: ResolverTypeWrapper<Starship>;
  StarshipFilmsConnection: ResolverTypeWrapper<StarshipFilmsConnection>;
  StarshipFilmsEdge: ResolverTypeWrapper<StarshipFilmsEdge>;
  StarshipPilotsConnection: ResolverTypeWrapper<StarshipPilotsConnection>;
  StarshipPilotsEdge: ResolverTypeWrapper<StarshipPilotsEdge>;
  StarshipsConnection: ResolverTypeWrapper<StarshipsConnection>;
  StarshipsEdge: ResolverTypeWrapper<StarshipsEdge>;
  String: ResolverTypeWrapper<Scalars['String']>;
  Vehicle: ResolverTypeWrapper<Vehicle>;
  VehicleFilmsConnection: ResolverTypeWrapper<VehicleFilmsConnection>;
  VehicleFilmsEdge: ResolverTypeWrapper<VehicleFilmsEdge>;
  VehiclePilotsConnection: ResolverTypeWrapper<VehiclePilotsConnection>;
  VehiclePilotsEdge: ResolverTypeWrapper<VehiclePilotsEdge>;
  VehiclesConnection: ResolverTypeWrapper<VehiclesConnection>;
  VehiclesEdge: ResolverTypeWrapper<VehiclesEdge>;
};

/** Mapping between all available schema types and the resolvers parents */
export type ResolversParentTypes = {
  Boolean: Scalars['Boolean'];
  Film: Film;
  FilmCharactersConnection: FilmCharactersConnection;
  FilmCharactersEdge: FilmCharactersEdge;
  FilmPlanetsConnection: FilmPlanetsConnection;
  FilmPlanetsEdge: FilmPlanetsEdge;
  FilmSpeciesConnection: FilmSpeciesConnection;
  FilmSpeciesEdge: FilmSpeciesEdge;
  FilmStarshipsConnection: FilmStarshipsConnection;
  FilmStarshipsEdge: FilmStarshipsEdge;
  FilmVehiclesConnection: FilmVehiclesConnection;
  FilmVehiclesEdge: FilmVehiclesEdge;
  FilmsConnection: FilmsConnection;
  FilmsEdge: FilmsEdge;
  Float: Scalars['Float'];
  ID: Scalars['ID'];
  Int: Scalars['Int'];
  Node:
    | ResolversParentTypes['Film']
    | ResolversParentTypes['Person']
    | ResolversParentTypes['Planet']
    | ResolversParentTypes['Species']
    | ResolversParentTypes['Starship']
    | ResolversParentTypes['Vehicle'];
  PageInfo: PageInfo;
  PeopleConnection: PeopleConnection;
  PeopleEdge: PeopleEdge;
  Person: Person;
  PersonFilmsConnection: PersonFilmsConnection;
  PersonFilmsEdge: PersonFilmsEdge;
  PersonStarshipsConnection: PersonStarshipsConnection;
  PersonStarshipsEdge: PersonStarshipsEdge;
  PersonVehiclesConnection: PersonVehiclesConnection;
  PersonVehiclesEdge: PersonVehiclesEdge;
  Planet: Planet;
  PlanetFilmsConnection: PlanetFilmsConnection;
  PlanetFilmsEdge: PlanetFilmsEdge;
  PlanetResidentsConnection: PlanetResidentsConnection;
  PlanetResidentsEdge: PlanetResidentsEdge;
  PlanetsConnection: PlanetsConnection;
  PlanetsEdge: PlanetsEdge;
  Root: {};
  Species: Species;
  SpeciesConnection: SpeciesConnection;
  SpeciesEdge: SpeciesEdge;
  SpeciesFilmsConnection: SpeciesFilmsConnection;
  SpeciesFilmsEdge: SpeciesFilmsEdge;
  SpeciesPeopleConnection: SpeciesPeopleConnection;
  SpeciesPeopleEdge: SpeciesPeopleEdge;
  Starship: Starship;
  StarshipFilmsConnection: StarshipFilmsConnection;
  StarshipFilmsEdge: StarshipFilmsEdge;
  StarshipPilotsConnection: StarshipPilotsConnection;
  StarshipPilotsEdge: StarshipPilotsEdge;
  StarshipsConnection: StarshipsConnection;
  StarshipsEdge: StarshipsEdge;
  String: Scalars['String'];
  Vehicle: Vehicle;
  VehicleFilmsConnection: VehicleFilmsConnection;
  VehicleFilmsEdge: VehicleFilmsEdge;
  VehiclePilotsConnection: VehiclePilotsConnection;
  VehiclePilotsEdge: VehiclePilotsEdge;
  VehiclesConnection: VehiclesConnection;
  VehiclesEdge: VehiclesEdge;
};

export type FilmResolvers<
  ContextType = any,
  ParentType extends ResolversParentTypes['Film'] = ResolversParentTypes['Film']
> = {
  characterConnection?: Resolver<
    Maybe<ResolversTypes['FilmCharactersConnection']>,
    ParentType,
    ContextType,
    Partial<FilmCharacterConnectionArgs>
  >;
  created?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  director?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  edited?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  episodeID?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  openingCrawl?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  planetConnection?: Resolver<
    Maybe<ResolversTypes['FilmPlanetsConnection']>,
    ParentType,
    ContextType,
    Partial<FilmPlanetConnectionArgs>
  >;
  producers?: Resolver<Maybe<Array<Maybe<ResolversTypes['String']>>>, ParentType, ContextType>;
  releaseDate?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  speciesConnection?: Resolver<
    Maybe<ResolversTypes['FilmSpeciesConnection']>,
    ParentType,
    ContextType,
    Partial<FilmSpeciesConnectionArgs>
  >;
  starshipConnection?: Resolver<
    Maybe<ResolversTypes['FilmStarshipsConnection']>,
    ParentType,
    ContextType,
    Partial<FilmStarshipConnectionArgs>
  >;
  title?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  vehicleConnection?: Resolver<
    Maybe<ResolversTypes['FilmVehiclesConnection']>,
    ParentType,
    ContextType,
    Partial<FilmVehicleConnectionArgs>
  >;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type FilmCharactersConnectionResolvers<
  ContextType = any,
  ParentType extends ResolversParentTypes['FilmCharactersConnection'] = ResolversParentTypes['FilmCharactersConnection']
> = {
  characters?: Resolver<Maybe<Array<Maybe<ResolversTypes['Person']>>>, ParentType, ContextType>;
  edges?: Resolver<Maybe<Array<Maybe<ResolversTypes['FilmCharactersEdge']>>>, ParentType, ContextType>;
  pageInfo?: Resolver<ResolversTypes['PageInfo'], ParentType, ContextType>;
  totalCount?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type FilmCharactersEdgeResolvers<
  ContextType = any,
  ParentType extends ResolversParentTypes['FilmCharactersEdge'] = ResolversParentTypes['FilmCharactersEdge']
> = {
  cursor?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  node?: Resolver<Maybe<ResolversTypes['Person']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type FilmPlanetsConnectionResolvers<
  ContextType = any,
  ParentType extends ResolversParentTypes['FilmPlanetsConnection'] = ResolversParentTypes['FilmPlanetsConnection']
> = {
  edges?: Resolver<Maybe<Array<Maybe<ResolversTypes['FilmPlanetsEdge']>>>, ParentType, ContextType>;
  pageInfo?: Resolver<ResolversTypes['PageInfo'], ParentType, ContextType>;
  planets?: Resolver<Maybe<Array<Maybe<ResolversTypes['Planet']>>>, ParentType, ContextType>;
  totalCount?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type FilmPlanetsEdgeResolvers<
  ContextType = any,
  ParentType extends ResolversParentTypes['FilmPlanetsEdge'] = ResolversParentTypes['FilmPlanetsEdge']
> = {
  cursor?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  node?: Resolver<Maybe<ResolversTypes['Planet']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type FilmSpeciesConnectionResolvers<
  ContextType = any,
  ParentType extends ResolversParentTypes['FilmSpeciesConnection'] = ResolversParentTypes['FilmSpeciesConnection']
> = {
  edges?: Resolver<Maybe<Array<Maybe<ResolversTypes['FilmSpeciesEdge']>>>, ParentType, ContextType>;
  pageInfo?: Resolver<ResolversTypes['PageInfo'], ParentType, ContextType>;
  species?: Resolver<Maybe<Array<Maybe<ResolversTypes['Species']>>>, ParentType, ContextType>;
  totalCount?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type FilmSpeciesEdgeResolvers<
  ContextType = any,
  ParentType extends ResolversParentTypes['FilmSpeciesEdge'] = ResolversParentTypes['FilmSpeciesEdge']
> = {
  cursor?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  node?: Resolver<Maybe<ResolversTypes['Species']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type FilmStarshipsConnectionResolvers<
  ContextType = any,
  ParentType extends ResolversParentTypes['FilmStarshipsConnection'] = ResolversParentTypes['FilmStarshipsConnection']
> = {
  edges?: Resolver<Maybe<Array<Maybe<ResolversTypes['FilmStarshipsEdge']>>>, ParentType, ContextType>;
  pageInfo?: Resolver<ResolversTypes['PageInfo'], ParentType, ContextType>;
  starships?: Resolver<Maybe<Array<Maybe<ResolversTypes['Starship']>>>, ParentType, ContextType>;
  totalCount?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type FilmStarshipsEdgeResolvers<
  ContextType = any,
  ParentType extends ResolversParentTypes['FilmStarshipsEdge'] = ResolversParentTypes['FilmStarshipsEdge']
> = {
  cursor?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  node?: Resolver<Maybe<ResolversTypes['Starship']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type FilmVehiclesConnectionResolvers<
  ContextType = any,
  ParentType extends ResolversParentTypes['FilmVehiclesConnection'] = ResolversParentTypes['FilmVehiclesConnection']
> = {
  edges?: Resolver<Maybe<Array<Maybe<ResolversTypes['FilmVehiclesEdge']>>>, ParentType, ContextType>;
  pageInfo?: Resolver<ResolversTypes['PageInfo'], ParentType, ContextType>;
  totalCount?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  vehicles?: Resolver<Maybe<Array<Maybe<ResolversTypes['Vehicle']>>>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type FilmVehiclesEdgeResolvers<
  ContextType = any,
  ParentType extends ResolversParentTypes['FilmVehiclesEdge'] = ResolversParentTypes['FilmVehiclesEdge']
> = {
  cursor?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  node?: Resolver<Maybe<ResolversTypes['Vehicle']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type FilmsConnectionResolvers<
  ContextType = any,
  ParentType extends ResolversParentTypes['FilmsConnection'] = ResolversParentTypes['FilmsConnection']
> = {
  edges?: Resolver<Maybe<Array<Maybe<ResolversTypes['FilmsEdge']>>>, ParentType, ContextType>;
  films?: Resolver<Maybe<Array<Maybe<ResolversTypes['Film']>>>, ParentType, ContextType>;
  pageInfo?: Resolver<ResolversTypes['PageInfo'], ParentType, ContextType>;
  totalCount?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type FilmsEdgeResolvers<
  ContextType = any,
  ParentType extends ResolversParentTypes['FilmsEdge'] = ResolversParentTypes['FilmsEdge']
> = {
  cursor?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  node?: Resolver<Maybe<ResolversTypes['Film']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type NodeResolvers<
  ContextType = any,
  ParentType extends ResolversParentTypes['Node'] = ResolversParentTypes['Node']
> = {
  __resolveType: TypeResolveFn<
    'Film' | 'Person' | 'Planet' | 'Species' | 'Starship' | 'Vehicle',
    ParentType,
    ContextType
  >;
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
};

export type PageInfoResolvers<
  ContextType = any,
  ParentType extends ResolversParentTypes['PageInfo'] = ResolversParentTypes['PageInfo']
> = {
  endCursor?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  hasNextPage?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  hasPreviousPage?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  startCursor?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type PeopleConnectionResolvers<
  ContextType = any,
  ParentType extends ResolversParentTypes['PeopleConnection'] = ResolversParentTypes['PeopleConnection']
> = {
  edges?: Resolver<Maybe<Array<Maybe<ResolversTypes['PeopleEdge']>>>, ParentType, ContextType>;
  pageInfo?: Resolver<ResolversTypes['PageInfo'], ParentType, ContextType>;
  people?: Resolver<Maybe<Array<Maybe<ResolversTypes['Person']>>>, ParentType, ContextType>;
  totalCount?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type PeopleEdgeResolvers<
  ContextType = any,
  ParentType extends ResolversParentTypes['PeopleEdge'] = ResolversParentTypes['PeopleEdge']
> = {
  cursor?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  node?: Resolver<Maybe<ResolversTypes['Person']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type PersonResolvers<
  ContextType = any,
  ParentType extends ResolversParentTypes['Person'] = ResolversParentTypes['Person']
> = {
  birthYear?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  created?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  edited?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  eyeColor?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  filmConnection?: Resolver<
    Maybe<ResolversTypes['PersonFilmsConnection']>,
    ParentType,
    ContextType,
    Partial<PersonFilmConnectionArgs>
  >;
  gender?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  hairColor?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  height?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  homeworld?: Resolver<Maybe<ResolversTypes['Planet']>, ParentType, ContextType>;
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  mass?: Resolver<Maybe<ResolversTypes['Float']>, ParentType, ContextType>;
  name?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  skinColor?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  species?: Resolver<Maybe<ResolversTypes['Species']>, ParentType, ContextType>;
  starshipConnection?: Resolver<
    Maybe<ResolversTypes['PersonStarshipsConnection']>,
    ParentType,
    ContextType,
    Partial<PersonStarshipConnectionArgs>
  >;
  vehicleConnection?: Resolver<
    Maybe<ResolversTypes['PersonVehiclesConnection']>,
    ParentType,
    ContextType,
    Partial<PersonVehicleConnectionArgs>
  >;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type PersonFilmsConnectionResolvers<
  ContextType = any,
  ParentType extends ResolversParentTypes['PersonFilmsConnection'] = ResolversParentTypes['PersonFilmsConnection']
> = {
  edges?: Resolver<Maybe<Array<Maybe<ResolversTypes['PersonFilmsEdge']>>>, ParentType, ContextType>;
  films?: Resolver<Maybe<Array<Maybe<ResolversTypes['Film']>>>, ParentType, ContextType>;
  pageInfo?: Resolver<ResolversTypes['PageInfo'], ParentType, ContextType>;
  totalCount?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type PersonFilmsEdgeResolvers<
  ContextType = any,
  ParentType extends ResolversParentTypes['PersonFilmsEdge'] = ResolversParentTypes['PersonFilmsEdge']
> = {
  cursor?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  node?: Resolver<Maybe<ResolversTypes['Film']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type PersonStarshipsConnectionResolvers<
  ContextType = any,
  ParentType extends ResolversParentTypes['PersonStarshipsConnection'] = ResolversParentTypes['PersonStarshipsConnection']
> = {
  edges?: Resolver<Maybe<Array<Maybe<ResolversTypes['PersonStarshipsEdge']>>>, ParentType, ContextType>;
  pageInfo?: Resolver<ResolversTypes['PageInfo'], ParentType, ContextType>;
  starships?: Resolver<Maybe<Array<Maybe<ResolversTypes['Starship']>>>, ParentType, ContextType>;
  totalCount?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type PersonStarshipsEdgeResolvers<
  ContextType = any,
  ParentType extends ResolversParentTypes['PersonStarshipsEdge'] = ResolversParentTypes['PersonStarshipsEdge']
> = {
  cursor?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  node?: Resolver<Maybe<ResolversTypes['Starship']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type PersonVehiclesConnectionResolvers<
  ContextType = any,
  ParentType extends ResolversParentTypes['PersonVehiclesConnection'] = ResolversParentTypes['PersonVehiclesConnection']
> = {
  edges?: Resolver<Maybe<Array<Maybe<ResolversTypes['PersonVehiclesEdge']>>>, ParentType, ContextType>;
  pageInfo?: Resolver<ResolversTypes['PageInfo'], ParentType, ContextType>;
  totalCount?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  vehicles?: Resolver<Maybe<Array<Maybe<ResolversTypes['Vehicle']>>>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type PersonVehiclesEdgeResolvers<
  ContextType = any,
  ParentType extends ResolversParentTypes['PersonVehiclesEdge'] = ResolversParentTypes['PersonVehiclesEdge']
> = {
  cursor?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  node?: Resolver<Maybe<ResolversTypes['Vehicle']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type PlanetResolvers<
  ContextType = any,
  ParentType extends ResolversParentTypes['Planet'] = ResolversParentTypes['Planet']
> = {
  climates?: Resolver<Maybe<Array<Maybe<ResolversTypes['String']>>>, ParentType, ContextType>;
  created?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  diameter?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  edited?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  filmConnection?: Resolver<
    Maybe<ResolversTypes['PlanetFilmsConnection']>,
    ParentType,
    ContextType,
    Partial<PlanetFilmConnectionArgs>
  >;
  gravity?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  name?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  orbitalPeriod?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  population?: Resolver<Maybe<ResolversTypes['Float']>, ParentType, ContextType>;
  residentConnection?: Resolver<
    Maybe<ResolversTypes['PlanetResidentsConnection']>,
    ParentType,
    ContextType,
    Partial<PlanetResidentConnectionArgs>
  >;
  rotationPeriod?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  surfaceWater?: Resolver<Maybe<ResolversTypes['Float']>, ParentType, ContextType>;
  terrains?: Resolver<Maybe<Array<Maybe<ResolversTypes['String']>>>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type PlanetFilmsConnectionResolvers<
  ContextType = any,
  ParentType extends ResolversParentTypes['PlanetFilmsConnection'] = ResolversParentTypes['PlanetFilmsConnection']
> = {
  edges?: Resolver<Maybe<Array<Maybe<ResolversTypes['PlanetFilmsEdge']>>>, ParentType, ContextType>;
  films?: Resolver<Maybe<Array<Maybe<ResolversTypes['Film']>>>, ParentType, ContextType>;
  pageInfo?: Resolver<ResolversTypes['PageInfo'], ParentType, ContextType>;
  totalCount?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type PlanetFilmsEdgeResolvers<
  ContextType = any,
  ParentType extends ResolversParentTypes['PlanetFilmsEdge'] = ResolversParentTypes['PlanetFilmsEdge']
> = {
  cursor?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  node?: Resolver<Maybe<ResolversTypes['Film']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type PlanetResidentsConnectionResolvers<
  ContextType = any,
  ParentType extends ResolversParentTypes['PlanetResidentsConnection'] = ResolversParentTypes['PlanetResidentsConnection']
> = {
  edges?: Resolver<Maybe<Array<Maybe<ResolversTypes['PlanetResidentsEdge']>>>, ParentType, ContextType>;
  pageInfo?: Resolver<ResolversTypes['PageInfo'], ParentType, ContextType>;
  residents?: Resolver<Maybe<Array<Maybe<ResolversTypes['Person']>>>, ParentType, ContextType>;
  totalCount?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type PlanetResidentsEdgeResolvers<
  ContextType = any,
  ParentType extends ResolversParentTypes['PlanetResidentsEdge'] = ResolversParentTypes['PlanetResidentsEdge']
> = {
  cursor?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  node?: Resolver<Maybe<ResolversTypes['Person']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type PlanetsConnectionResolvers<
  ContextType = any,
  ParentType extends ResolversParentTypes['PlanetsConnection'] = ResolversParentTypes['PlanetsConnection']
> = {
  edges?: Resolver<Maybe<Array<Maybe<ResolversTypes['PlanetsEdge']>>>, ParentType, ContextType>;
  pageInfo?: Resolver<ResolversTypes['PageInfo'], ParentType, ContextType>;
  planets?: Resolver<Maybe<Array<Maybe<ResolversTypes['Planet']>>>, ParentType, ContextType>;
  totalCount?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type PlanetsEdgeResolvers<
  ContextType = any,
  ParentType extends ResolversParentTypes['PlanetsEdge'] = ResolversParentTypes['PlanetsEdge']
> = {
  cursor?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  node?: Resolver<Maybe<ResolversTypes['Planet']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type RootResolvers<
  ContextType = any,
  ParentType extends ResolversParentTypes['Root'] = ResolversParentTypes['Root']
> = {
  allFilms?: Resolver<Maybe<ResolversTypes['FilmsConnection']>, ParentType, ContextType, Partial<RootAllFilmsArgs>>;
  allPeople?: Resolver<Maybe<ResolversTypes['PeopleConnection']>, ParentType, ContextType, Partial<RootAllPeopleArgs>>;
  allPlanets?: Resolver<
    Maybe<ResolversTypes['PlanetsConnection']>,
    ParentType,
    ContextType,
    Partial<RootAllPlanetsArgs>
  >;
  allSpecies?: Resolver<
    Maybe<ResolversTypes['SpeciesConnection']>,
    ParentType,
    ContextType,
    Partial<RootAllSpeciesArgs>
  >;
  allStarships?: Resolver<
    Maybe<ResolversTypes['StarshipsConnection']>,
    ParentType,
    ContextType,
    Partial<RootAllStarshipsArgs>
  >;
  allVehicles?: Resolver<
    Maybe<ResolversTypes['VehiclesConnection']>,
    ParentType,
    ContextType,
    Partial<RootAllVehiclesArgs>
  >;
  film?: Resolver<Maybe<ResolversTypes['Film']>, ParentType, ContextType, Partial<RootFilmArgs>>;
  node?: Resolver<Maybe<ResolversTypes['Node']>, ParentType, ContextType, RequireFields<RootNodeArgs, 'id'>>;
  person?: Resolver<Maybe<ResolversTypes['Person']>, ParentType, ContextType, Partial<RootPersonArgs>>;
  planet?: Resolver<Maybe<ResolversTypes['Planet']>, ParentType, ContextType, Partial<RootPlanetArgs>>;
  species?: Resolver<Maybe<ResolversTypes['Species']>, ParentType, ContextType, Partial<RootSpeciesArgs>>;
  starship?: Resolver<Maybe<ResolversTypes['Starship']>, ParentType, ContextType, Partial<RootStarshipArgs>>;
  vehicle?: Resolver<Maybe<ResolversTypes['Vehicle']>, ParentType, ContextType, Partial<RootVehicleArgs>>;
};

export type SpeciesResolvers<
  ContextType = any,
  ParentType extends ResolversParentTypes['Species'] = ResolversParentTypes['Species']
> = {
  averageHeight?: Resolver<Maybe<ResolversTypes['Float']>, ParentType, ContextType>;
  averageLifespan?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  classification?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  created?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  designation?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  edited?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  eyeColors?: Resolver<Maybe<Array<Maybe<ResolversTypes['String']>>>, ParentType, ContextType>;
  filmConnection?: Resolver<
    Maybe<ResolversTypes['SpeciesFilmsConnection']>,
    ParentType,
    ContextType,
    Partial<SpeciesFilmConnectionArgs>
  >;
  hairColors?: Resolver<Maybe<Array<Maybe<ResolversTypes['String']>>>, ParentType, ContextType>;
  homeworld?: Resolver<Maybe<ResolversTypes['Planet']>, ParentType, ContextType>;
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  language?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  name?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  personConnection?: Resolver<
    Maybe<ResolversTypes['SpeciesPeopleConnection']>,
    ParentType,
    ContextType,
    Partial<SpeciesPersonConnectionArgs>
  >;
  skinColors?: Resolver<Maybe<Array<Maybe<ResolversTypes['String']>>>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type SpeciesConnectionResolvers<
  ContextType = any,
  ParentType extends ResolversParentTypes['SpeciesConnection'] = ResolversParentTypes['SpeciesConnection']
> = {
  edges?: Resolver<Maybe<Array<Maybe<ResolversTypes['SpeciesEdge']>>>, ParentType, ContextType>;
  pageInfo?: Resolver<ResolversTypes['PageInfo'], ParentType, ContextType>;
  species?: Resolver<Maybe<Array<Maybe<ResolversTypes['Species']>>>, ParentType, ContextType>;
  totalCount?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type SpeciesEdgeResolvers<
  ContextType = any,
  ParentType extends ResolversParentTypes['SpeciesEdge'] = ResolversParentTypes['SpeciesEdge']
> = {
  cursor?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  node?: Resolver<Maybe<ResolversTypes['Species']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type SpeciesFilmsConnectionResolvers<
  ContextType = any,
  ParentType extends ResolversParentTypes['SpeciesFilmsConnection'] = ResolversParentTypes['SpeciesFilmsConnection']
> = {
  edges?: Resolver<Maybe<Array<Maybe<ResolversTypes['SpeciesFilmsEdge']>>>, ParentType, ContextType>;
  films?: Resolver<Maybe<Array<Maybe<ResolversTypes['Film']>>>, ParentType, ContextType>;
  pageInfo?: Resolver<ResolversTypes['PageInfo'], ParentType, ContextType>;
  totalCount?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type SpeciesFilmsEdgeResolvers<
  ContextType = any,
  ParentType extends ResolversParentTypes['SpeciesFilmsEdge'] = ResolversParentTypes['SpeciesFilmsEdge']
> = {
  cursor?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  node?: Resolver<Maybe<ResolversTypes['Film']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type SpeciesPeopleConnectionResolvers<
  ContextType = any,
  ParentType extends ResolversParentTypes['SpeciesPeopleConnection'] = ResolversParentTypes['SpeciesPeopleConnection']
> = {
  edges?: Resolver<Maybe<Array<Maybe<ResolversTypes['SpeciesPeopleEdge']>>>, ParentType, ContextType>;
  pageInfo?: Resolver<ResolversTypes['PageInfo'], ParentType, ContextType>;
  people?: Resolver<Maybe<Array<Maybe<ResolversTypes['Person']>>>, ParentType, ContextType>;
  totalCount?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type SpeciesPeopleEdgeResolvers<
  ContextType = any,
  ParentType extends ResolversParentTypes['SpeciesPeopleEdge'] = ResolversParentTypes['SpeciesPeopleEdge']
> = {
  cursor?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  node?: Resolver<Maybe<ResolversTypes['Person']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type StarshipResolvers<
  ContextType = any,
  ParentType extends ResolversParentTypes['Starship'] = ResolversParentTypes['Starship']
> = {
  MGLT?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  cargoCapacity?: Resolver<Maybe<ResolversTypes['Float']>, ParentType, ContextType>;
  consumables?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  costInCredits?: Resolver<Maybe<ResolversTypes['Float']>, ParentType, ContextType>;
  created?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  crew?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  edited?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  filmConnection?: Resolver<
    Maybe<ResolversTypes['StarshipFilmsConnection']>,
    ParentType,
    ContextType,
    Partial<StarshipFilmConnectionArgs>
  >;
  hyperdriveRating?: Resolver<Maybe<ResolversTypes['Float']>, ParentType, ContextType>;
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  length?: Resolver<Maybe<ResolversTypes['Float']>, ParentType, ContextType>;
  manufacturers?: Resolver<Maybe<Array<Maybe<ResolversTypes['String']>>>, ParentType, ContextType>;
  maxAtmospheringSpeed?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  model?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  name?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  passengers?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  pilotConnection?: Resolver<
    Maybe<ResolversTypes['StarshipPilotsConnection']>,
    ParentType,
    ContextType,
    Partial<StarshipPilotConnectionArgs>
  >;
  starshipClass?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type StarshipFilmsConnectionResolvers<
  ContextType = any,
  ParentType extends ResolversParentTypes['StarshipFilmsConnection'] = ResolversParentTypes['StarshipFilmsConnection']
> = {
  edges?: Resolver<Maybe<Array<Maybe<ResolversTypes['StarshipFilmsEdge']>>>, ParentType, ContextType>;
  films?: Resolver<Maybe<Array<Maybe<ResolversTypes['Film']>>>, ParentType, ContextType>;
  pageInfo?: Resolver<ResolversTypes['PageInfo'], ParentType, ContextType>;
  totalCount?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type StarshipFilmsEdgeResolvers<
  ContextType = any,
  ParentType extends ResolversParentTypes['StarshipFilmsEdge'] = ResolversParentTypes['StarshipFilmsEdge']
> = {
  cursor?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  node?: Resolver<Maybe<ResolversTypes['Film']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type StarshipPilotsConnectionResolvers<
  ContextType = any,
  ParentType extends ResolversParentTypes['StarshipPilotsConnection'] = ResolversParentTypes['StarshipPilotsConnection']
> = {
  edges?: Resolver<Maybe<Array<Maybe<ResolversTypes['StarshipPilotsEdge']>>>, ParentType, ContextType>;
  pageInfo?: Resolver<ResolversTypes['PageInfo'], ParentType, ContextType>;
  pilots?: Resolver<Maybe<Array<Maybe<ResolversTypes['Person']>>>, ParentType, ContextType>;
  totalCount?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type StarshipPilotsEdgeResolvers<
  ContextType = any,
  ParentType extends ResolversParentTypes['StarshipPilotsEdge'] = ResolversParentTypes['StarshipPilotsEdge']
> = {
  cursor?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  node?: Resolver<Maybe<ResolversTypes['Person']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type StarshipsConnectionResolvers<
  ContextType = any,
  ParentType extends ResolversParentTypes['StarshipsConnection'] = ResolversParentTypes['StarshipsConnection']
> = {
  edges?: Resolver<Maybe<Array<Maybe<ResolversTypes['StarshipsEdge']>>>, ParentType, ContextType>;
  pageInfo?: Resolver<ResolversTypes['PageInfo'], ParentType, ContextType>;
  starships?: Resolver<Maybe<Array<Maybe<ResolversTypes['Starship']>>>, ParentType, ContextType>;
  totalCount?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type StarshipsEdgeResolvers<
  ContextType = any,
  ParentType extends ResolversParentTypes['StarshipsEdge'] = ResolversParentTypes['StarshipsEdge']
> = {
  cursor?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  node?: Resolver<Maybe<ResolversTypes['Starship']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type VehicleResolvers<
  ContextType = any,
  ParentType extends ResolversParentTypes['Vehicle'] = ResolversParentTypes['Vehicle']
> = {
  cargoCapacity?: Resolver<Maybe<ResolversTypes['Float']>, ParentType, ContextType>;
  consumables?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  costInCredits?: Resolver<Maybe<ResolversTypes['Float']>, ParentType, ContextType>;
  created?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  crew?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  edited?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  filmConnection?: Resolver<
    Maybe<ResolversTypes['VehicleFilmsConnection']>,
    ParentType,
    ContextType,
    Partial<VehicleFilmConnectionArgs>
  >;
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  length?: Resolver<Maybe<ResolversTypes['Float']>, ParentType, ContextType>;
  manufacturers?: Resolver<Maybe<Array<Maybe<ResolversTypes['String']>>>, ParentType, ContextType>;
  maxAtmospheringSpeed?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  model?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  name?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  passengers?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  pilotConnection?: Resolver<
    Maybe<ResolversTypes['VehiclePilotsConnection']>,
    ParentType,
    ContextType,
    Partial<VehiclePilotConnectionArgs>
  >;
  vehicleClass?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type VehicleFilmsConnectionResolvers<
  ContextType = any,
  ParentType extends ResolversParentTypes['VehicleFilmsConnection'] = ResolversParentTypes['VehicleFilmsConnection']
> = {
  edges?: Resolver<Maybe<Array<Maybe<ResolversTypes['VehicleFilmsEdge']>>>, ParentType, ContextType>;
  films?: Resolver<Maybe<Array<Maybe<ResolversTypes['Film']>>>, ParentType, ContextType>;
  pageInfo?: Resolver<ResolversTypes['PageInfo'], ParentType, ContextType>;
  totalCount?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type VehicleFilmsEdgeResolvers<
  ContextType = any,
  ParentType extends ResolversParentTypes['VehicleFilmsEdge'] = ResolversParentTypes['VehicleFilmsEdge']
> = {
  cursor?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  node?: Resolver<Maybe<ResolversTypes['Film']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type VehiclePilotsConnectionResolvers<
  ContextType = any,
  ParentType extends ResolversParentTypes['VehiclePilotsConnection'] = ResolversParentTypes['VehiclePilotsConnection']
> = {
  edges?: Resolver<Maybe<Array<Maybe<ResolversTypes['VehiclePilotsEdge']>>>, ParentType, ContextType>;
  pageInfo?: Resolver<ResolversTypes['PageInfo'], ParentType, ContextType>;
  pilots?: Resolver<Maybe<Array<Maybe<ResolversTypes['Person']>>>, ParentType, ContextType>;
  totalCount?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type VehiclePilotsEdgeResolvers<
  ContextType = any,
  ParentType extends ResolversParentTypes['VehiclePilotsEdge'] = ResolversParentTypes['VehiclePilotsEdge']
> = {
  cursor?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  node?: Resolver<Maybe<ResolversTypes['Person']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type VehiclesConnectionResolvers<
  ContextType = any,
  ParentType extends ResolversParentTypes['VehiclesConnection'] = ResolversParentTypes['VehiclesConnection']
> = {
  edges?: Resolver<Maybe<Array<Maybe<ResolversTypes['VehiclesEdge']>>>, ParentType, ContextType>;
  pageInfo?: Resolver<ResolversTypes['PageInfo'], ParentType, ContextType>;
  totalCount?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  vehicles?: Resolver<Maybe<Array<Maybe<ResolversTypes['Vehicle']>>>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type VehiclesEdgeResolvers<
  ContextType = any,
  ParentType extends ResolversParentTypes['VehiclesEdge'] = ResolversParentTypes['VehiclesEdge']
> = {
  cursor?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  node?: Resolver<Maybe<ResolversTypes['Vehicle']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type Resolvers<ContextType = any> = {
  Film?: FilmResolvers<ContextType>;
  FilmCharactersConnection?: FilmCharactersConnectionResolvers<ContextType>;
  FilmCharactersEdge?: FilmCharactersEdgeResolvers<ContextType>;
  FilmPlanetsConnection?: FilmPlanetsConnectionResolvers<ContextType>;
  FilmPlanetsEdge?: FilmPlanetsEdgeResolvers<ContextType>;
  FilmSpeciesConnection?: FilmSpeciesConnectionResolvers<ContextType>;
  FilmSpeciesEdge?: FilmSpeciesEdgeResolvers<ContextType>;
  FilmStarshipsConnection?: FilmStarshipsConnectionResolvers<ContextType>;
  FilmStarshipsEdge?: FilmStarshipsEdgeResolvers<ContextType>;
  FilmVehiclesConnection?: FilmVehiclesConnectionResolvers<ContextType>;
  FilmVehiclesEdge?: FilmVehiclesEdgeResolvers<ContextType>;
  FilmsConnection?: FilmsConnectionResolvers<ContextType>;
  FilmsEdge?: FilmsEdgeResolvers<ContextType>;
  Node?: NodeResolvers<ContextType>;
  PageInfo?: PageInfoResolvers<ContextType>;
  PeopleConnection?: PeopleConnectionResolvers<ContextType>;
  PeopleEdge?: PeopleEdgeResolvers<ContextType>;
  Person?: PersonResolvers<ContextType>;
  PersonFilmsConnection?: PersonFilmsConnectionResolvers<ContextType>;
  PersonFilmsEdge?: PersonFilmsEdgeResolvers<ContextType>;
  PersonStarshipsConnection?: PersonStarshipsConnectionResolvers<ContextType>;
  PersonStarshipsEdge?: PersonStarshipsEdgeResolvers<ContextType>;
  PersonVehiclesConnection?: PersonVehiclesConnectionResolvers<ContextType>;
  PersonVehiclesEdge?: PersonVehiclesEdgeResolvers<ContextType>;
  Planet?: PlanetResolvers<ContextType>;
  PlanetFilmsConnection?: PlanetFilmsConnectionResolvers<ContextType>;
  PlanetFilmsEdge?: PlanetFilmsEdgeResolvers<ContextType>;
  PlanetResidentsConnection?: PlanetResidentsConnectionResolvers<ContextType>;
  PlanetResidentsEdge?: PlanetResidentsEdgeResolvers<ContextType>;
  PlanetsConnection?: PlanetsConnectionResolvers<ContextType>;
  PlanetsEdge?: PlanetsEdgeResolvers<ContextType>;
  Root?: RootResolvers<ContextType>;
  Species?: SpeciesResolvers<ContextType>;
  SpeciesConnection?: SpeciesConnectionResolvers<ContextType>;
  SpeciesEdge?: SpeciesEdgeResolvers<ContextType>;
  SpeciesFilmsConnection?: SpeciesFilmsConnectionResolvers<ContextType>;
  SpeciesFilmsEdge?: SpeciesFilmsEdgeResolvers<ContextType>;
  SpeciesPeopleConnection?: SpeciesPeopleConnectionResolvers<ContextType>;
  SpeciesPeopleEdge?: SpeciesPeopleEdgeResolvers<ContextType>;
  Starship?: StarshipResolvers<ContextType>;
  StarshipFilmsConnection?: StarshipFilmsConnectionResolvers<ContextType>;
  StarshipFilmsEdge?: StarshipFilmsEdgeResolvers<ContextType>;
  StarshipPilotsConnection?: StarshipPilotsConnectionResolvers<ContextType>;
  StarshipPilotsEdge?: StarshipPilotsEdgeResolvers<ContextType>;
  StarshipsConnection?: StarshipsConnectionResolvers<ContextType>;
  StarshipsEdge?: StarshipsEdgeResolvers<ContextType>;
  Vehicle?: VehicleResolvers<ContextType>;
  VehicleFilmsConnection?: VehicleFilmsConnectionResolvers<ContextType>;
  VehicleFilmsEdge?: VehicleFilmsEdgeResolvers<ContextType>;
  VehiclePilotsConnection?: VehiclePilotsConnectionResolvers<ContextType>;
  VehiclePilotsEdge?: VehiclePilotsEdgeResolvers<ContextType>;
  VehiclesConnection?: VehiclesConnectionResolvers<ContextType>;
  VehiclesEdge?: VehiclesEdgeResolvers<ContextType>;
};
