import 'graphql-codegen-core/dist/testing';
import { introspectionToGraphQLSchema, makeExecutableSchema } from 'graphql-codegen-core';
import { readFileSync } from 'fs';
import { plugin } from '../dist';
import gql from 'graphql-tag';

describe('TypeScript Client', () => {
  const schema = introspectionToGraphQLSchema(JSON.parse(readFileSync('./tests/files/schema.json', 'utf-8')));

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

    const content = await plugin(schema, [{ filePath: '', content: query }], {});

    expect(content).toBeSimilarStringTo(`
    export namespace MyFeed {
      export type Variables = {
      }
      export type Query = {
        __typename?: "Query";
        feed?: (Feed | null)[] | null;
      }
      export type Feed = {
        __typename?: "Entry";
        id: number; 
        commentCount: number; 
        repository: Repository; 
      }
      export type Repository = {
        __typename?: "Repository";
        full_name: string; 
        html_url: string; 
        owner?: Owner | null; 
      }
      export type Owner = {
        __typename?: "User";
        avatar_url: string; 
      }
    }
  `);
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

    const content = await plugin(testSchema, [{ filePath: '', content: query }], {});
    expect(content).not.toContain('export namespace my_fragment {');
    expect(content).not.toContain('export type VE2User = {');
    expect(content).toContain('export namespace MyFragment {');
    expect(content).toContain('export type Ve2User = {');
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

    const content = await plugin(testSchema, [{ filePath: '', content: query }], {});

    expect(content).toBeSimilarStringTo(`
      export namespace Me {
        export type Variables = {
        }

        export type Query = {
          __typename?: "Query";
          me?: Me | null;
        }

        export type Me = {
          __typename?: "User";
          id: number;
          profile?: Profile | null;
          favFriend?: FavFriend | null;
        }

        export type Profile = {
          __typename?: "Profile";
          name: string;
        }

        export type FavFriend = {
          __typename?: "User";
          id: number;
          profile?: _Profile | null;
          favFriend?: _FavFriend | null;
        }

        export type _Profile = {
          __typename?: "Profile";
          email: string;
        }
        
        export type _FavFriend = {
          __typename?: "User";
          id: number;
          profile?: __Profile | null;
        }
        
        export type __Profile = {
          __typename?: "Profile";
          email: string;
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

    const content = await plugin(schema, [{ filePath: '', content: query }], {});

    expect(content).toBeSimilarStringTo(`
    export namespace AnonymousQuery_1 {
      export type Variables = {
      }
      export type Query = {
        __typename?: "Query";
        feed?: (Feed | null)[] | null;
      }
      export type Feed = {
        __typename?: "Entry";
        id: number; 
        commentCount: number; 
        repository: Repository; 
      }
      export type Repository = {
        __typename?: "Repository";
        full_name: string; 
        html_url: string; 
        owner?: Owner | null; 
      }
      export type Owner = {
        __typename?: "User";
        avatar_url: string; 
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

    const content = await plugin(schema, [{ filePath: '', content: query }], {});

    expect(content).toBeSimilarStringTo(`
        export namespace MyFeed {
          export type Variables = {
          }
          export type Query = {
            __typename?: "Query";
            feed?: (Feed | null)[] | null;
          }
          export type Feed = {
            __typename?: "Entry";
            id: number; 
            commentCount: number; 
            repository: Repository; 
          }
          export type Repository = {
            __typename?: "Repository";
            full_name: string; 
          } & RepoFields.Fragment
        }
      `);
    expect(content).toBeSimilarStringTo(`
        export namespace RepoFields {
          export type Fragment = {
            __typename?: "Repository";
            html_url: string; 
            owner?: Owner | null; 
          }
          export type Owner = {
            __typename?: "User";
            avatar_url: string; 
          }
        }
      `);
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

    const content = await plugin(testSchema, [{ filePath: '', content: query }], { noNamespaces: true });

    expect(content).toBeSimilarStringTo(`
    export type MeVariables = {
    }
  `);

    expect(content).toBeSimilarStringTo(`
    export type MeQuery = {
      __typename?: "Query";
      me?: MeMe | null;
    }
  `);

    expect(content).toBeSimilarStringTo(`
    export type MeMe = {
      __typename?: "User";
      id: number;
      data?: Json | null;
      access?: Access | null;
    }
  `);
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

    const content = await plugin(schema, [{ filePath: '', content: query }], { noNamespaces: true });

    expect(content).toBeSimilarStringTo(`
    export type MyFeedVariables = {
    }
  
    export type MyFeedQuery = {
      __typename?: "Query";
      feed?: MyFeedFeed[] | null;
    }
  
    export type MyFeedFeed = {
      __typename?: "Entry";
      id: number; 
      commentCount: number; 
      repository: MyFeedRepository; 
    }
  
    export type MyFeedRepository = {
      __typename?: MyFeedRepositoryInlineFragment["__typename"] | MyFeed_RepositoryInlineFragment["__typename"];
      html_url: string; 
    } & (MyFeedRepositoryInlineFragment | MyFeed_RepositoryInlineFragment)
  
    export type MyFeedRepositoryInlineFragment = {
      __typename?: "Repository";
      full_name: string; 
    }
  
    export type MyFeed_RepositoryInlineFragment = {
      __typename?: "Repository";
      owner?: MyFeedOwner | null; 
    }
  
    export type MyFeedOwner = {
      __typename?: "User";
      avatar_url: string; 
    }
`);
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

    const content = await plugin(schema, [{ filePath: '', content: query }], {});

    expect(content).toBeSimilarStringTo(`
    export namespace MyFeed {
      export type Variables = {
      }
    
      export type Query = {
        __typename?: "Query";
        feed?: (Feed | null)[] | null;
      }
    
      export type Feed = {
        __typename?: "Entry";
        id: number; 
        commentCount: number; 
        repository: Repository; 
      }
    
      export type Repository = {
        __typename?: RepositoryInlineFragment["__typename"] | _RepositoryInlineFragment["__typename"];
        html_url: string; 
      } & (RepositoryInlineFragment | _RepositoryInlineFragment)
    
      export type RepositoryInlineFragment = {
        __typename?: "Repository";
        full_name: string; 
      }
    
      export type _RepositoryInlineFragment = {
        __typename?: "Repository";
        owner?: Owner | null; 
      }
    
      export type Owner = {
        __typename?: "User";
        avatar_url: string; 
      }
    }
  `);
  });

  it('Should separate fragments with |', async () => {
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

    const content = await plugin(testSchema, [{ filePath: '', content: query }], {});
    expect(content).toBeSimilarStringTo(`
    export type Extra = PhotoFragment.Fragment | SportFragment.Fragment | SportInlineFragment | PhotoInlineFragment
  `);
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

    const content = await plugin(schema, [{ filePath: '', content: query }], { noNamespaces: true });

    expect(content).toBeSimilarStringTo(`
    export type MyFeedVariables = {
    }
    export type MyFeedQuery = {
      __typename?: "Query";
      feed?: MyFeedFeed[] | null;
    }
    export type MyFeedFeed = {
      __typename?: "Entry";
      id: number; 
      commentCount: number; 
      repository: MyFeedRepository; 
    }
    export type MyFeedRepository = {
      __typename?: "Repository";
      full_name: string; 
    } & RepoFieldsFragment
`);
    expect(content).toBeSimilarStringTo(`
    export type RepoFieldsFragment = {
      __typename?: "Repository";
      html_url: string; 
      owner?: RepoFieldsOwner | null; 
    }
    export type RepoFieldsOwner = {
      __typename?: "User";
      avatar_url: string; 
    }
`);
  });
});
