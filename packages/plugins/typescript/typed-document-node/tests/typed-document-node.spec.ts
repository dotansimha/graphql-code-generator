import { mergeOutputs, Types } from '@graphql-codegen/plugin-helpers';
import { DocumentMode } from '@graphql-codegen/visitor-plugin-common';
import { buildSchema, parse } from 'graphql';
import { plugin } from '../src/index.js';

describe('TypedDocumentNode', () => {
  it('Should not output imports when there are no operations at all', async () => {
    const result = (await plugin(null as any, [], {})) as Types.ComplexPluginOutput;
    expect(result.content).toBe('');
    expect(result.prepend.length).toBe(0);
  });

  it('dedupes fragments automatically when documentMode=graphQLTag', async () => {
    const schema = buildSchema(/* GraphQL */ `
      type Query {
        person(id: ID!): Person!
      }
      type Person {
        id: ID!
        name: String!
        children: [Person!]
      }
    `);

    const document = parse(/* GraphQL */ `
      query Person {
        person(id: 1) {
          ...PersonDetails
          children {
            ...BasePersonDetails
          }
        }
      }

      fragment PersonDetails on Person {
        ...BasePersonDetails
        name
      }

      fragment BasePersonDetails on Person {
        id
      }
    `);

    const result = mergeOutputs([
      await plugin(
        schema,
        [{ document }],
        {
          documentMode: DocumentMode.graphQLTag,
        },
        { outputFile: '' }
      ),
    ]);

    expect(result).toMatchInlineSnapshot(`
      "import { TypedDocumentNode as DocumentNode } from '@graphql-typed-document-node/core';
      import gql from 'graphql-tag';
      export const BasePersonDetailsFragmentDoc = gql\`
          fragment BasePersonDetails on Person {
        id
      }
          \` as unknown as DocumentNode<BasePersonDetailsFragment, unknown>;
      export const PersonDetailsFragmentDoc = gql\`
          fragment PersonDetails on Person {
        ...BasePersonDetails
        name
      }
          \` as unknown as DocumentNode<PersonDetailsFragment, unknown>;
      export const PersonDocument = gql\`
          query Person {
        person(id: 1) {
          ...PersonDetails
          children {
            ...BasePersonDetails
          }
        }
      }
          \${PersonDetailsFragmentDoc}
      \${BasePersonDetailsFragmentDoc}\` as unknown as DocumentNode<PersonQuery, PersonQueryVariables>;"
    `);
  });

  describe('addTypenameToSelectionSets', () => {
    it('Check is add __typename to typed document', async () => {
      const schema = buildSchema(/* GraphQL */ `
        schema {
          query: Query
        }

        type Query {
          job: Job
        }

        type Job {
          id: ID!
        }
      `);

      const ast = parse(/* GraphQL */ `
        query {
          job {
            id
          }
        }
      `);

      const res = (await plugin(
        schema,
        [{ location: '', document: ast }],
        { addTypenameToSelectionSets: true },
        { outputFile: '' }
      )) as Types.ComplexPluginOutput;

      expect((res.content.match(/__typename/g) || []).length).toBe(1);
    });

    it('Check with __typename in selection set', async () => {
      const schema = buildSchema(/* GraphQL */ `
        schema {
          query: Query
        }

        type Query {
          job: Job
        }

        type Job {
          id: ID!
        }
      `);

      const ast = parse(/* GraphQL */ `
        query {
          job {
            id
            __typename
          }
        }
      `);

      const res = (await plugin(
        schema,
        [{ location: '', document: ast }],
        { addTypenameToSelectionSets: true },
        { outputFile: '' }
      )) as Types.ComplexPluginOutput;

      expect((res.content.match(/__typename/g) || []).length).toBe(1);
    });
  });

  describe('addTypenameToSelectionSets', () => {
    it('Should import Types from the given file', async () => {
      const schema = buildSchema(/* GraphQL */ `
        schema {
          query: Query
        }

        type Query {
          job: Job
        }

        type Job {
          id: ID!
        }
      `);

      const ast = parse(/* GraphQL */ `
        query {
          job {
            ...JobFragment
          }
        }

        fragment JobFragment on Job {
          id
        }
      `);

      const res = (await plugin(
        schema,
        [{ location: '', document: ast }],
        { importOperationTypesFrom: 'file.ts' },
        { outputFile: '' }
      )) as Types.ComplexPluginOutput;

      expect((res.content.match(/<Types.Query, Types.QueryVariables>/g) || []).length).toBe(1);
      expect((res.content.match(/<Types.JobFragmentFragment, unknown>/g) || []).length).toBe(1);
    });
  });
});
