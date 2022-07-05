import { Types } from '@graphql-codegen/plugin-helpers';
import { buildSchema, parse } from 'graphql';
import { plugin } from '../src/index.js';

describe('TypedDocumentNode', () => {
  it('Should not output imports when there are no operations at all', async () => {
    const result = (await plugin(null as any, [], {})) as Types.ComplexPluginOutput;
    expect(result.content).toBe('');
    expect(result.prepend.length).toBe(0);
  });

  it('Duplicated nested fragments handle (dedupeFragments=true)', async () => {
    const schema = buildSchema(/* GraphQL */ `
      schema {
        query: Query
      }

      type Query {
        jobs: [Job!]!
      }

      type Job {
        id: ID!
        recruiterName: String!
        title: String!
      }
    `);

    const ast = parse(/* GraphQL */ `
      query GetJobs {
        jobs {
          ...DataForPageA
          ...DataForPageB
          ...JobSimpleRecruiterData
        }
      }

      fragment DataForPageA on Job {
        id
        ...JobSimpleRecruiterData
      }

      fragment DataForPageB on Job {
        title
        ...JobSimpleRecruiterData
      }

      fragment JobSimpleRecruiterData on Job {
        recruiterName
      }
    `);

    const res = (await plugin(
      schema,
      [{ location: '', document: ast }],
      { dedupeFragments: true },
      { outputFile: '' }
    )) as Types.ComplexPluginOutput;

    expect((res.content.match(/JobSimpleRecruiterDataFragmentDoc.definitions/g) || []).length).toBe(1);
  });

  it('Check with nested and recursive fragments handle (dedupeFragments=true)', async () => {
    const schema = buildSchema(/* GraphQL */ `
      type Query {
        test: MyType
        nested: MyOtherType
      }

      type MyOtherType {
        myType: MyType!
        myOtherTypeRecursive: MyOtherType!
      }

      type MyType {
        foo: String!
      }
    `);

    const ast = parse(/* GraphQL */ `
      query test {
        test {
          ...MyTypeFields
          nested {
            myOtherTypeRecursive {
              myType {
                ...MyTypeFields
              }
              myOtherTypeRecursive {
                ...MyOtherTypeRecursiveFields
              }
            }
            myType {
              ...MyTypeFields
            }
          }
        }
      }

      fragment MyOtherTypeRecursiveFields on MyOtherType {
        myType {
          ...MyTypeFields
        }
      }

      fragment MyTypeFields on MyType {
        foo
      }
    `);

    const res = (await plugin(
      schema,
      [{ location: '', document: ast }],
      { dedupeFragments: true },
      { outputFile: '' }
    )) as Types.ComplexPluginOutput;

    expect((res.content.match(/MyTypeFieldsFragmentDoc.definitions/g) || []).length).toBe(1);
  });

  it('Ignore duplicated nested fragments handle (dedupeFragments=false)', async () => {
    const schema = buildSchema(/* GraphQL */ `
      schema {
        query: Query
      }

      type Query {
        jobs: [Job!]!
      }

      type Job {
        id: ID!
        recruiterName: String!
        title: String!
      }
    `);

    const ast = parse(/* GraphQL */ `
      query GetJobs {
        jobs {
          ...DataForPageA
          ...DataForPageB
        }
      }

      fragment DataForPageA on Job {
        id
        ...JobSimpleRecruiterData
      }

      fragment DataForPageB on Job {
        title
        ...JobSimpleRecruiterData
      }

      fragment JobSimpleRecruiterData on Job {
        recruiterName
      }
    `);

    const res = (await plugin(
      schema,
      [{ location: '', document: ast }],
      { dedupeFragments: false },
      { outputFile: '' }
    )) as Types.ComplexPluginOutput;

    expect((res.content.match(/JobSimpleRecruiterDataFragmentDoc.definitions/g) || []).length).toBe(2);
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
});
