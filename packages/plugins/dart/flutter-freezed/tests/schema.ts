import { buildSchema } from 'graphql';

export const movieSchema = buildSchema(/* GraphQL */ `
  type Movie {
    id: ID!
    title: String!
  }

  input CreateMovieInput {
    title: String!
  }

  input UpsertMovieInput {
    id: ID!
    title: String!
  }

  input UpdateMovieInput {
    id: ID!
    title: String
  }

  input DeleteMovieInput {
    id: ID!
  }
`);

export const starWarsSchema = buildSchema(/* GraphQL */ `
  enum Episode {
    NEWHOPE
    EMPIRE
    JEDI
  }

  type Starship {
    id: ID!
    name: String!
    length: Float
  }

  interface Character {
    id: ID!
    name: String!
    friends: [Character]
    appearsIn: [Episode]!
  }

  type MovieCharacter {
    name: String!
    appearsIn: [Episode]!
  }

  type Human implements Character {
    id: ID!
    name: String!
    friends: [MovieCharacter]
    appearsIn: [Episode]!
    starships: [Starship]
    totalCredits: Int
  }

  type Droid implements Character {
    id: ID!
    name: String!
    friends: [MovieCharacter]
    appearsIn: [Episode]!
    primaryFunction: String
  }

  union SearchResult = Human | Droid | Starship
`);

export const cyclicSchema = buildSchema(/* GraphQL */ `
  input BaseAInput {
    b: BaseBInput!
  }

  input BaseBInput {
    c: BaseCInput!
  }

  input BaseCInput {
    a: BaseAInput!
  }

  type Base {
    id: String
  }
`);

export const nonNullableListWithCustomScalars = buildSchema(/* GraphQL */ `
  scalar UUID
  scalar timestamptz
  scalar jsonb

  type ComplexType {
    a: [String]
    b: [ID!]
    c: [Boolean!]!
    d: [[Int]]
    e: [[Float]!]
    f: [[String]!]!
    g: jsonb
    h: timestamptz!
    i: UUID!
  }
`);
