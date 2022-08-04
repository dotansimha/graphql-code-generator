import { plugin } from '../src/index.js';
import { parse, buildClientSchema } from 'graphql';
import { Types } from '@graphql-codegen/plugin-helpers';
import { resolve, join } from 'path';
import { readFileSync } from 'fs';

const githunt = resolve(__dirname, '../../../../../dev-test/githunt/');

describe('RTK Query', () => {
  let spyConsoleError: jest.SpyInstance;
  beforeEach(() => {
    spyConsoleError = jest.spyOn(console, 'warn');
    spyConsoleError.mockImplementation();
  });

  afterEach(() => {
    spyConsoleError.mockRestore();
  });

  const schema = buildClientSchema(require(join(githunt, 'schema.json')));
  const gql = {
    commentQuery: readFileSync(join(githunt, 'comment.query.graphql'), { encoding: 'utf-8' }),
    feedQuery: readFileSync(join(githunt, 'feed.query.graphql'), { encoding: 'utf-8' }),
    voteButtonsFragment: readFileSync(join(githunt, 'vote-buttons.fragment.graphql'), { encoding: 'utf-8' }),
    newEntryMutation: readFileSync(join(githunt, 'new-entry.mutation.graphql'), { encoding: 'utf-8' }),
  };

  test('Without hooks', async () => {
    const documents = parse(gql.commentQuery + gql.feedQuery + gql.newEntryMutation);
    const docs = [{ location: '', document: documents }];

    const content = (await plugin(
      schema,
      docs,
      {
        importBaseApiFrom: './baseApi',
        exportHooks: false,
      },
      {
        outputFile: 'graphql.ts',
      }
    )) as Types.ComplexPluginOutput;

    expect(content.prepend).toContain("import { api } from './baseApi';");

    expect(content.content).toMatchSnapshot();
  });
  test('With hooks', async () => {
    const documents = parse(gql.commentQuery + gql.feedQuery + gql.newEntryMutation);
    const docs = [{ location: '', document: documents }];

    const content = (await plugin(
      schema,
      docs,
      {
        importBaseApiFrom: './baseApi',
        exportHooks: true,
      },
      {
        outputFile: 'graphql.ts',
      }
    )) as Types.ComplexPluginOutput;

    expect(content.prepend).toContain("import { api } from './baseApi';");

    expect(content.content).toMatchSnapshot();
  });
  test('With overrideExisting', async () => {
    const documents = parse(gql.commentQuery + gql.feedQuery + gql.newEntryMutation);
    const docs = [{ location: '', document: documents }];

    const content = (await plugin(
      schema,
      docs,
      {
        importBaseApiFrom: './baseApi',
        exportHooks: false,
        overrideExisting: 'module.hot?.status() === "apply"',
      },
      {
        outputFile: 'graphql.ts',
      }
    )) as Types.ComplexPluginOutput;

    expect(content.prepend).toContain("import { api } from './baseApi';");
    expect(content.content).toContain('overrideExisting: module.hot?.status() === "apply",');

    expect(content.content).toMatchSnapshot();
  });
  test('For fragment', async () => {
    const documents = parse(gql.voteButtonsFragment);
    const docs = [{ location: '', document: documents }];

    const content = (await plugin(
      schema,
      docs,
      {
        importBaseApiFrom: './baseApi',
        exportHooks: true,
      },
      {
        outputFile: 'graphql.ts',
      }
    )) as Types.ComplexPluginOutput;

    expect(content.prepend).not.toContain("import { api } from './baseApi';");
    expect(content.content).not.toContain('api.injectEndpoints');

    expect(content.content).toMatchSnapshot();
  });
});
