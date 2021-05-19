import { Types } from '@graphql-codegen/plugin-helpers';
import { buildSchema, parse } from 'graphql';
import { plugin } from '../src';

describe('TypeDocumentNode', () => {
  it('Should not output imports when there are no operations at all', async () => {
    const result = (await plugin(null as any, [], {})) as Types.ComplexPluginOutput;
    expect(result.content).toBe('');
    expect(result.prepend.length).toBe(0);
  });

  it('Duplicated nested fragments handle', async () => {
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
      {},
      { outputFile: '' }
    )) as Types.ComplexPluginOutput;

    expect(res.content).toContain(`"definitions":deDupeDefinitions`);
  });
});
