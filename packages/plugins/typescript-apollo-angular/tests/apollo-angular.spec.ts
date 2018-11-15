import 'graphql-codegen-core/dist/testing';
import { gql, introspectionToGraphQLSchema, schemaToTemplateContext, transformDocument } from 'graphql-codegen-core';
import { plugin, addToSchema } from '../dist';
import * as fs from 'fs';
import { DocumentNode, extendSchema } from 'graphql';

describe('Components', () => {
  const schema = introspectionToGraphQLSchema(JSON.parse(fs.readFileSync('./tests/files/schema.json').toString()));

  it('should generate Component with noGraphqlTag = true', async () => {
    const query = gql`
      query MyFeed {
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

    const content = await plugin(schema, [{ filePath: '', content: query }], { noGraphqlTag: true });

    expect(content).toBeSimilarStringTo(`
      import * as Apollo from 'apollo-angular';
    `);
    expect(content).not.toBeSimilarStringTo(`
      import gql from 'graphql-tag';
    `);
    expect(content).toBeSimilarStringTo(`
      import { Injectable } from '@angular/core';
    `);
    expect(content).toBeSimilarStringTo(`
      @Injectable({
        providedIn: 'root'
      })
      export class MyFeedGQL extends Apollo.Query
    `);
  });

  it('should generate correct Component when noNamespaces enabled', async () => {
    const query = gql`
      query MyFeed {
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

    const content = await plugin(schema, [{ filePath: '', content: query }], {
      noNamespaces: true,
      noGraphqlTag: true
    });

    expect(content).toBeSimilarStringTo(`
      @Injectable({
        providedIn: 'root'
      })
      export class MyFeedGQL extends Apollo.Query<MyFeedQuery, MyFeedVariables> {
    `);
  });

  it('should generate correct Component when noNamespaces disabled', async () => {
    const query = gql`
      query MyFeed {
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
      @Injectable({
        providedIn: 'root'
      })
      export class MyFeedGQL extends Apollo.Query<MyFeed.Query, MyFeed.Variables> {
    `);
  });

  it('should use parsed document instead of graphql-tag', async () => {
    const query = gql`
      query MyFeed {
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

    // location might be different so let's skip it
    delete query.loc;
    const rawContent = await plugin(schema, [{ filePath: '', content: query }], {
      noNamespaces: true,
      noGraphqlTag: true
    });
    const content = rawContent.replace(/,"loc":{"start":\d+,"end":\d+}}\s+}/, '}');

    expect(content).toBeSimilarStringTo(`
      @Injectable({
        providedIn: 'root'
      })
      export class MyFeedGQL extends Apollo.Query<MyFeedQuery, MyFeedVariables> {
    `);

    expect(content).toBeSimilarStringTo(`
      document: any = ${JSON.stringify(query)}
    `);
  });

  it('should not escape html', async () => {
    const query = gql`
      query MyFeed {
        feed(search: "phrase") {
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
      document: any = gql\` query MyFeed {
    `);

    expect(content.includes('&quot;')).toBe(false);
    expect(content.includes('"phrase"')).toBe(true);
  });

  it('should handle fragments', async () => {
    const repositoryWithOwner = gql`
      fragment RepositoryWithOwner on Repository {
        full_name
        html_url
        owner {
          avatar_url
        }
      }
    `;
    const feedWithRepository = gql`
      fragment FeedWithRepository on FeedType {
        id
        commentCount
        repository(search: "phrase") {
          ...RepositoryWithOwner
        }
      }

      ${repositoryWithOwner}
    `;
    const myFeed = gql`
      query MyFeed {
        feed {
          ...FeedWithRepository
        }
      }

      ${feedWithRepository}
    `;

    const documents = [repositoryWithOwner, feedWithRepository, myFeed];
    const files = documents.map(query => ({ filePath: '', content: query }));
    const content = await plugin(schema, files, {});

    expect(content).toBeSimilarStringTo(`
      document: any = gql\` query MyFeed {
          feed {
            ...FeedWithRepository
          }
        }
        \${FeedWithRepositoryFragment}
      \`
    `);

    expect(content).toBeSimilarStringTo(`
      const FeedWithRepositoryFragment = gql\` fragment FeedWithRepository on FeedType {
        id
        commentCount
        repository(search: "phrase") {
          ...RepositoryWithOwner
        }
      }
      \${RepositoryWithOwnerFragment}
      \`;
    `);

    expect(content).toBeSimilarStringTo(`
      const RepositoryWithOwnerFragment = gql\` fragment RepositoryWithOwner on Repository {
          full_name
          html_url
          owner {
            avatar_url
          }
        }
      \`;
    `);
  });

  it('should handle @client', async () => {
    const myFeed = gql`
      query MyFeed {
        feed @client {
          id
        }
      }
    `;

    const content = await plugin(schema, [{ filePath: '', content: myFeed }], {});

    expect(content).toBeSimilarStringTo(`
      document: any = gql\` query MyFeed {
          feed @client {
            id
          }
        }
      \`
    `);
  });

  test('import NgModules and remove NgModule directive', async () => {
    const modifiedSchema = extendSchema(schema, addToSchema);
    expect(modifiedSchema.getDirective('NgModule').name).toBe('NgModule');
    const modulePath = '../my/lazy-module';
    const moduleName = 'LazyModule';

    const myFeed = gql(`
      query MyFeed {
        feed @client @NgModule(module: "${modulePath}#${moduleName}") {
          id
        }
      }
    `);
    const content = await plugin(modifiedSchema, [{ filePath: '', content: myFeed }], {});
    expect(content).toMatch(`import { ${moduleName} } from '${modulePath}'`);

    expect(content).toBeSimilarStringTo(`
      @Injectable({
        providedIn: ${moduleName}
      })
      export class MyFeedGQL
    `);

    expect(content).toBeSimilarStringTo(`
      document: any = gql\` query MyFeed {
        feed @client {
          id
        }
      }
      \`
    `);
  });

  test('import namedClient and remove namedClient directive', async () => {
    const modifiedSchema = extendSchema(schema, addToSchema);
    expect(modifiedSchema.getDirective('namedClient').name).toBe('namedClient');

    const myFeed = gql(`
      query MyFeed {
        feed @namedClient(name: "custom") {
          id
        }
      }
    `);

    const content = await plugin(modifiedSchema, [{ filePath: '', content: myFeed }], {});

    expect(content).toBeSimilarStringTo(`
      document: any = gql\` query MyFeed {
        feed {
          id
        }
      }
      \`
    `);

    expect(content).toBeSimilarStringTo(`
      client = 'custom';
    `);
  });

  it('no duplicated fragments', async () => {
    const simpleFeed = gql`
      fragment SimpleFeed on FeedType {
        id
        commentCount
      }
    `;
    const myFeed = gql`
      query MyFeed {
        feed {
          ...SimpleFeed
        }
        allFeeds {
          ...SimpleFeed
        }
      }
    `;

    const documents = [simpleFeed, myFeed];
    const content = await plugin(schema, documents.map(content => ({ content, filePath: '' })), {});

    expect(content).toBeSimilarStringTo(`
      document: any = gql\` query MyFeed {
          feed {
            ...SimpleFeed
          }
          allFeeds {
            ...SimpleFeed
          }
        }
        \${SimpleFeedFragment}
      \`
    `);

    expect(content).toBeSimilarStringTo(`
      const SimpleFeedFragment = gql\` fragment SimpleFeed on FeedType {
        id
        commentCount
      }
      \`;
    `);
  });

  it('write fragments in proper order (when one depends on other)', async () => {
    const myFeed = gql`
      fragment FeedWithRepository on FeedType {
        id
        repository {
          ...RepositoryWithOwner
        }
      }
      fragment RepositoryWithOwner on Repository {
        full_name
      }
      query MyFeed {
        feed {
          ...FeedWithRepository
        }
      }
    `;

    const content = await plugin(schema, [{ filePath: '', content: myFeed }], {});
    const feedWithRepositoryPos = content.indexOf('fragment FeedWithRepository');
    const repositoryWithOwnerPos = content.indexOf('fragment RepositoryWithOwner');

    expect(repositoryWithOwnerPos).toBeLessThan(feedWithRepositoryPos);
  });

  it('should add comments (non-graphql)', async () => {
    const myFeed = gql`
      fragment FeedWithRepository on FeedType {
        id
        repository {
          ...RepositoryWithOwner
        }
      }
      fragment RepositoryWithOwner on Repository {
        full_name
      }
      query MyFeed {
        feed {
          ...FeedWithRepository
        }
      }
    `;

    const content = await plugin(schema, [{ filePath: '', content: myFeed }], {});

    expect(content).toBeSimilarStringTo('// START: Apollo Angular template');
    expect(content).toBeSimilarStringTo('// GraphQL Fragments');
    expect(content).toBeSimilarStringTo('// Apollo Services');
    expect(content).toBeSimilarStringTo('// END: Apollo Angular template');
  });

  it(`should skip if there's no operations`, async () => {
    const content = await plugin(schema, [], {});

    expect(content).not.toContain('// START: Apollo Angular template');
    expect(content).not.toContain('// END: Apollo Angular template');
    expect(content).not.toContain(`import * as Apollo from 'apollo-angular';`);
    expect(content).not.toContain(`import gql from 'graphql-tag';`);
    expect(content).not.toContain(`import { Injectable } from '@angular/core';`);
  });
});
