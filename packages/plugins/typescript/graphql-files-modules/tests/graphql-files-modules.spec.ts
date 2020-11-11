import { validateTs } from '@graphql-codegen/testing';
import { plugin } from '../src/index';
import { parse } from 'graphql';

describe('graphql-codegen typescript-graphql-files-modules', () => {
  it('Should generate simple module with one file', async () => {
    const result = await plugin(
      null,
      [
        {
          location: 'some/file/my-query.graphql',
          document: parse(/* GraphQL */ `
            query MyQuery {
              field
            }
          `),
        },
      ],
      {},
      { outputFile: '' }
    );

    expect(result).toBeSimilarStringTo(`
      declare module '*/my-query.graphql' {
        import { DocumentNode } from 'graphql';
        const defaultDocument: DocumentNode;
        export const MyQuery: DocumentNode;
      
        export default defaultDocument;
      }
    `);
    validateTs(result);
  });

  it('Should generate correctly for mutiple files', async () => {
    const result = await plugin(
      null,
      [
        {
          location: 'some/file/my-query.graphql',
          document: parse(/* GraphQL */ `
            query MyQuery {
              field
            }
          `),
        },
        {
          location: 'some/file/my-other-query.graphql',
          document: parse(/* GraphQL */ `
            query OtherQuery {
              field
            }
          `),
        },
      ],
      {},
      { outputFile: '' }
    );

    expect(result).toBeSimilarStringTo(`
      declare module '*/my-query.graphql' {
        import { DocumentNode } from 'graphql';
        const defaultDocument: DocumentNode;
        export const MyQuery: DocumentNode;
      
        export default defaultDocument;
      }

      declare module '*/my-other-query.graphql' {
        import { DocumentNode } from 'graphql';
        const defaultDocument: DocumentNode;
        export const OtherQuery: DocumentNode;
      
        export default defaultDocument;
      }
    `);
    validateTs(result);
  });

  it('Should ignore unnamed documents', async () => {
    const result = await plugin(
      null,
      [
        {
          location: 'some/file/my-query.graphql',
          document: parse(/* GraphQL */ `
            query {
              field
            }
          `),
        },
      ],
      {},
      { outputFile: '' }
    );

    expect(result).toBeSimilarStringTo(`
      declare module '*/my-query.graphql' {
        import { DocumentNode } from 'graphql';
        const defaultDocument: DocumentNode;
      
        export default defaultDocument;
      }
    `);
    validateTs(result);
  });

  it('Should generate simple module with two documents in one file', async () => {
    const result = await plugin(
      null,
      [
        {
          location: 'some/file/my-query.graphql',
          document: parse(/* GraphQL */ `
            query MyQuery {
              field
            }

            query OtherQuery {
              field
            }
          `),
        },
      ],
      {},
      { outputFile: '' }
    );

    expect(result).toBeSimilarStringTo(`
      declare module '*/my-query.graphql' {
        import { DocumentNode } from 'graphql';
        const defaultDocument: DocumentNode;
        export const MyQuery: DocumentNode;
        export const OtherQuery: DocumentNode;
      
        export default defaultDocument;
      }
    `);
    validateTs(result);
  });

  it('Should generate simple module with two documents in two files, with same name', async () => {
    const result = await plugin(
      null,
      [
        {
          location: 'some/file/my-query.graphql',
          document: parse(/* GraphQL */ `
            query MyQuery {
              field
            }
          `),
        },
        {
          location: 'some/file-other-path/my-query.graphql',
          document: parse(/* GraphQL */ `
            query OtherQuery {
              field
            }
          `),
        },
      ],
      {},
      { outputFile: '' }
    );

    expect(result).toBeSimilarStringTo(`
      declare module '*/my-query.graphql' {
        import { DocumentNode } from 'graphql';
        const defaultDocument: DocumentNode;
        export const MyQuery: DocumentNode;
        export const OtherQuery: DocumentNode;
      
        export default defaultDocument;
      }
    `);
    validateTs(result);
  });

  it('Should generate simple module with a custom path prefix', async () => {
    const result = await plugin(
      null,
      [
        {
          location: 'some/file/my-query.graphql',
          document: parse(/* GraphQL */ `
            query MyQuery {
              field
            }
          `),
        },
      ],
      { modulePathPrefix: 'api/' },
      { outputFile: '' }
    );

    expect(result).toBeSimilarStringTo(`
      declare module '*/api/my-query.graphql' {
        import { DocumentNode } from 'graphql';
        const defaultDocument: DocumentNode;
        export const MyQuery: DocumentNode;
      
        export default defaultDocument;
      }
    `);
    validateTs(result);
  });
});
