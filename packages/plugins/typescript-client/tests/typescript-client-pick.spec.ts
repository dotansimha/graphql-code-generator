import 'graphql-codegen-core/dist/testing';
import { makeExecutableSchema } from 'graphql-tools';
import { readFileSync } from 'fs';
import { plugin } from '../dist';
import gql from 'graphql-tag';
import { buildClientSchema } from 'graphql';

describe('TypeScript Client', () => {
  const schema = buildClientSchema(JSON.parse(readFileSync('./tests/files/schema.json', 'utf-8')));

  it('Should generate simple Query correctly', async () => {
    const query = gql`
      query myFeed {
        feed {
          id
          commentCount
          repository {
            full_name
            html_url
            owner {
              avatar_url
            }
          }
        }
      }
    `;

    const content = await plugin(
      schema,
      [{ filePath: '', content: query }],
      {},
      {
        outputFile: 'graphql.ts'
      }
    );

    expect(content).toBeSimilarStringTo(`
    export namespace MyFeed {
      export type Variables = {
      }
      export type Query =  {
        __typename?: "Query";
        feed: Maybe<(Pick<Entry,'id'> & Pick<Entry,'commentCount'> & { repository: Pick<Repository,'full_name'> & Pick<Repository,'html_url'> & { owner: Pick<User,'avatar_url'> } })[]>
      }

    }`);
  });

  it('Should generate and convert names correctly', async () => {
    const testSchema = makeExecutableSchema({
      typeDefs: `
      type User_Special {
        id: String!
        name: String!
      }
      type Query {
        users: [User_Special]
        vE2_User: [User_Special]
      }
      `
    });

    const query = gql`
      query Query1 {
        users {
          ...my_fragment
        }
      }
      fragment my_fragment on User_Special {
        id
        name
      }
      query Query2 {
        vE2_User {
          id
          name
        }
      }
    `;

    const content = await plugin(
      testSchema,
      [{ filePath: '', content: query }],
      {},
      {
        outputFile: 'graphql.ts'
      }
    );
    expect(content).toBeSimilarStringTo(`
    export namespace Query1 {
      export type Variables = {
      }
      export type Query =  {
        __typename?: "Query";
        users: Maybe<(Pick<User_Special,'id'> & Pick<User_Special,'name'>)[]>
      }

    }

    export namespace Query2 {
      export type Variables = {
      }
      export type Query =  {
        __typename?: "Query";
        vE2_User: Maybe<(Pick<User_Special,'id'> & Pick<User_Special,'name'>)[]>
      }

    }`);
    expect(content).not.toContain('export namespace my_fragment {');
    expect(content).not.toContain('export type VE2User = {');
    // expect(content).toContain('export namespace MyFragment {');
    // expect(content).toContain('export type Ve2User = {');
  });

  it('Should generate nested types', async () => {
    const testSchema = makeExecutableSchema({
      typeDefs: `
        type User {
          profile: Profile
          id: Int!
          favFriend: User
        }
        type Profile {
          name: String!
          email: String!
        }
        
        type Query {
          me: User
        }
      `
    });

    const query = gql`
      query me {
        me {
          id
          profile {
            name
          }
          favFriend {
            id
            profile {
              email
            }
            favFriend {
              id
              profile {
                email
              }
            }
          }
        }
      }
    `;

    const content = await plugin(
      testSchema,
      [{ filePath: '', content: query }],
      {},
      {
        outputFile: 'graphql.ts'
      }
    );

    expect(content).toBeSimilarStringTo(`
    export namespace Me {
      export type Variables = {
      }
      export type Query =  {
        __typename?: "Query";
        me: Maybe<Pick<User,'id'> & { profile: Pick<Profile,'name'> } & { favFriend: Pick<User,'id'> & { profile: Pick<Profile,'email'> } & { favFriend: Pick<User,'id'> & { profile: Pick<Profile,'email'> } } }>
      }

    }`);
  });

  it('Should generate anonymous Query correctly', async () => {
    const query = gql`
      query {
        feed {
          id
          commentCount
          repository {
            full_name
            html_url
            owner {
              avatar_url
            }
          }
        }
      }
    `;

    const content = await plugin(
      schema,
      [{ filePath: '', content: query }],
      {},
      {
        outputFile: 'graphql.ts'
      }
    );

    expect(content).toBeSimilarStringTo(`
    export namespace AnonymousQuery_1 {
      export type Variables = {
      }
      export type Query =  {
        __typename?: "Query";
        feed: Maybe<(Pick<Entry,'id'> & Pick<Entry,'commentCount'> & { repository: Pick<Repository,'full_name'> & Pick<Repository,'html_url'> & { owner: Pick<User,'avatar_url'> } })[]>
      }

    }`);
  });

  it('Should generate simple Query with Fragment spread correctly', async () => {
    const query = gql`
      query myFeed {
        feed {
          id
          commentCount
          repository {
            full_name
            ...RepoFields
          }
        }
      }

      fragment RepoFields on Repository {
        html_url
        owner {
          avatar_url
        }
      }
    `;

    const content = await plugin(
      schema,
      [{ filePath: '', content: query }],
      {},
      {
        outputFile: 'graphql.ts'
      }
    );

    expect(content).toBeSimilarStringTo(`
    export namespace MyFeed {
      export type Variables = {
      }
      export type Query =  {
        __typename?: "Query";
        feed: Maybe<(Pick<Entry,'id'> & Pick<Entry,'commentCount'> & { repository: Pick<Repository,'full_name'> & Pick<Repository,'html_url'> & { owner: Pick<User,'avatar_url'> } })[]>
      }

    }`);
  });

  it('should preserve a prefix for Unions', async () => {
    const testSchema = makeExecutableSchema({
      typeDefs: gql`
        schema {
          query: Query
        }

        type Query {
          me: User
          user(id: ID!): User
        }

        type Pizza {
          dough: String!
          toppings: [String!]
        }

        type Hamburger {
          patty: String!
          toppings: [String!]
        }

        union FavoriteFood = Pizza | Hamburger

        type User {
          id: ID!
          favoriteFood: FavoriteFood!
        }
      `
    });

    const query = gql`
      query findUser($userId: ID!) {
        user(id: $userId) {
          id
          favoriteFood {
            ... on Pizza {
              dough
              toppings
            }
            ... on Hamburger {
              patty
              toppings
            }
          }
        }
      }
    `;

    const content = await plugin(
      testSchema,
      [{ filePath: '', content: query }],
      { noNamespaces: true },
      {
        outputFile: 'graphql.ts'
      }
    );

    expect(content).toBeSimilarStringTo(`
    export type FindUserVariables = {
      userId: string;
    }
    export type FindUserQuery =  {
      __typename?: "Query";
      user: Maybe<Pick<User,'id'> & { favoriteFood: Pick<Pizza,'dough'> & Pick<Pizza,'toppings'> & Pick<Hamburguer,'patty'> & Pick<Hamburguer,'toppings'> }>
    }`);
  });

  it('Should generate correctly when using scalar and noNamespace', async () => {
    const testSchema = makeExecutableSchema({
      typeDefs: gql`
        scalar JSON

        enum Access {
          Read
          Write
          All
        }

        type User {
          id: Int!
          data: JSON
          access: Access
        }

        type Query {
          me: User
        }
      `
    });
    const query = gql`
      query me {
        me {
          id
          data
          access
        }
      }
    `;

    const content = await plugin(
      testSchema,
      [{ filePath: '', content: query }],
      { noNamespaces: true },
      {
        outputFile: 'graphql.ts'
      }
    );

    expect(content).toBeSimilarStringTo(`
    export type MeVariables = {
    }
    export type MeQuery =  {
      __typename?: "Query";
      me: Maybe<Pick<User,'id'> & Pick<User,'data'> & Pick<User,'access'>>
    }`);
  });

  it('Should generate simple Query with inline Fragment and handle noNamespaces', async () => {
    const query = gql`
      query myFeed {
        feed {
          id
          commentCount
          repository {
            html_url
            ... on Repository {
              full_name
            }
            ... on Repository {
              owner {
                avatar_url
              }
            }
          }
        }
      }
    `;

    const content = await plugin(
      schema,
      [{ filePath: '', content: query }],
      { noNamespaces: true },
      {
        outputFile: 'graphql.ts'
      }
    );

    expect(content).toBeSimilarStringTo(`
    export type MyFeedVariables = {
    }
    export type MyFeedQuery =  {
      __typename?: "Query";
      feed: Maybe<(Pick<Entry,'id'> & Pick<Entry,'commentCount'> & { repository: Pick<Repository,'html_url'> & Pick<Repository,'full_name'> & { owner: Pick<User,'avatar_url'> } })[]>
    }`);
  });

  it('Should generate simple Query with inline Fragment', async () => {
    const query = gql`
      query myFeed {
        feed {
          id
          commentCount
          repository {
            html_url
            ... on Repository {
              full_name
              owner {
                avatar_url
              }
            }
          }
        }
      }
    `;

    const content = await plugin(
      schema,
      [{ filePath: '', content: query }],
      {},
      {
        outputFile: 'graphql.ts'
      }
    );

    expect(content).toBeSimilarStringTo(`
    export namespace MyFeed {
      export type Variables = {
      }
      export type Query =  {
        __typename?: "Query";
        feed: Maybe<(Pick<Entry,'id'> & Pick<Entry,'commentCount'> & { repository: Pick<Repository,'html_url'> & Pick<Repository,'full_name'> & { owner: Pick<User,'avatar_url'> } })[]>
      }

    }`);
  });

  it('Should group fragments by type', async () => {
    const testSchema = makeExecutableSchema({
      resolverValidationOptions: {
        requireResolversForResolveType: false
      },
      typeDefs: `
        type Photo {
          height: Int!
          width: Int!
        }
        
        type Sport {
          id: Int!
          name: String!
          teams: Int!
        }
        
        union Extra = Photo | Sport
        
        type Person {
          extra: Extra
        }
        
        type Query {
          person: Person
        }
      `
    });

    const query = gql`
      fragment PhotoFragment on Photo {
        width
      }
      fragment SportFragment on Sport {
        id
      }
      query search {
        person {
          extra {
            ...PhotoFragment
            ...SportFragment
            ... on Sport {
              name
            }
            ... on Photo {
              height
            }
          }
        }
      }
    `;

    const content = await plugin(
      testSchema,
      [{ filePath: '', content: query }],
      {},
      {
        outputFile: 'graphql.ts'
      }
    );

    expect(content).toBeSimilarStringTo(`
    export namespace Search {
      export type Variables = {
      }
      export type Query =  {
        __typename?: "Query";
        person: Maybe<{ extra: Pick<Photo,'width'> & Pick<Sport,'id'> Pick<Sport,'name'> & Pick<Photo,'height'> }>
      }

    }`);
  });

  it('Should generate simple Query with Fragment spread and handle noNamespaces', async () => {
    const query = gql`
      query myFeed {
        feed {
          id
          commentCount
          repository {
            full_name
            ...RepoFields
          }
        }
      }
      fragment RepoFields on Repository {
        html_url
        owner {
          avatar_url
        }
      }
    `;

    const content = await plugin(
      schema,
      [{ filePath: '', content: query }],
      { noNamespaces: true },
      {
        outputFile: 'graphql.ts'
      }
    );

    expect(content).toBeSimilarStringTo(`
    export type MyFeedVariables = {
    }
    export type MyFeedQuery =  {
      __typename?: "Query";
      feed: Maybe<(Pick<Entry,'id'> & Pick<Entry,'commentCount'> & { repository: Pick<Repository,'full_name'> & Pick<Repository,'html_url'> & { owner: Pick<User,'avatar_url'> } })[]>
    }`);
  });

  it('should generate correctly when using immutableTypes and noNamespace', async () => {
    const testSchema = makeExecutableSchema({
      typeDefs: gql`
        type Country {
          id: Int!
          code: String!
          name: String!
        }

        type CountriesPayload {
          countries: [Country!]
        }

        type Query {
          countries: CountriesPayload!
        }
      `
    });
    const query = gql`
      query Countries {
        countries {
          countries {
            code
            name
          }
        }
      }
    `;

    const content = await plugin(
      testSchema,
      [{ filePath: '', content: query }],
      {
        immutableTypes: true,
        noNamespaces: true
      },
      {
        outputFile: 'graphql.ts'
      }
    );

    expect(content).toBeSimilarStringTo(`
    export type CountriesVariables = {
    }
    export type CountriesQuery =  {
      readonly __typename?: "Query";
      readonly countries: Maybe<{ countries: (Pick<Country,'code'> & Pick<Country,'name'>)[] }>
    }`);
  });

  it('should generate correctly when using immutableTypes', async () => {
    const testSchema = makeExecutableSchema({
      typeDefs: gql`
        type Country {
          id: Int!
          code: String!
          name: String!
        }

        type CountriesPayload {
          countries: [Country!]
        }

        type Query {
          countries: CountriesPayload!
        }
      `
    });
    const query = gql`
      query Countries {
        countries {
          countries {
            code
            name
          }
        }
      }
    `;

    const content = await plugin(
      testSchema,
      [{ filePath: '', content: query }],
      {
        immutableTypes: true
      },
      {
        outputFile: 'graphql.ts'
      }
    );

    expect(content).toBeSimilarStringTo(`
    export namespace Countries {
      export type Variables = {
      }
      export type Query =  {
        readonly __typename?: "Query";
        readonly countries: Maybe<{ countries: (Pick<Country,'code'> & Pick<Country,'name'>)[] }>
      }

    }`);
  });

  it('should generate correctly when using noNamespace', async () => {
    const testSchema = makeExecutableSchema({
      typeDefs: gql`
        type Country {
          id: Int!
          code: String!
          name: String!
        }

        type CountriesPayload {
          countries: [Country!]
        }

        type Query {
          countries: CountriesPayload!
        }
      `
    });
    const query = gql`
      query Countries {
        countries {
          countries {
            code
            name
          }
        }
      }
    `;

    const content = await plugin(
      testSchema,
      [{ filePath: '', content: query }],
      {
        noNamespaces: true
      },
      {
        outputFile: 'graphql.ts'
      }
    );

    expect(content).toBeSimilarStringTo(`
    export type CountriesVariables = {
    }
    export type CountriesQuery =  {
      __typename?: "Query";
      countries: Maybe<{ countries: (Pick<Country,'code'> & Pick<Country,'name'>)[] }>
    }`);
  });

  it('should make __typename non optional when requested', async () => {
    const testSchema = makeExecutableSchema({
      typeDefs: gql`
        type Post {
          title: String
        }

        type Query {
          post: Post!
        }
      `
    });
    const query = gql`
      query Post {
        post {
          __typename
          title
        }
      }
    `;

    const content = await plugin(
      testSchema,
      [{ filePath: '', content: query }],
      {},
      {
        outputFile: 'graphql.ts'
      }
    );

    expect(content).toBeSimilarStringTo(`
    export namespace Post {
      export type Variables = {
      }
      export type Query =  {
        __typename?: "Query";
        post: Maybe<{_typename: "Post" & Pick<Post,'title'>}>
      }

    }`);
  });

  it('should make __typename non optional when requested within an inline fragment', async () => {
    const testSchema = makeExecutableSchema({
      typeDefs: gql`
        type Post {
          title: String
        }

        type Query {
          post: Post!
        }
      `
    });
    const query = gql`
      query Post {
        post {
          ... on Post {
            __typename
            title
          }
        }
      }
    `;

    const content = await plugin(
      testSchema,
      [{ filePath: '', content: query }],
      {},
      {
        outputFile: 'graphql.ts'
      }
    );

    expect(content).toBeSimilarStringTo(`
    export namespace Post {
      export type Variables = {
      }
      export type Query =  {
        __typename?: "Query";
        post: Maybe<{_typename: "Post" & Pick<Post,'title'>}>
      }

    }`);
  });
});
