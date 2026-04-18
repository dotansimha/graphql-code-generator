import * as path from 'path';
import type { Types } from '@graphql-codegen/plugin-helpers';
import { executeCodegen } from '../src/index.js';

const SIMPLE_TEST_SCHEMA = /* GraphQL */ `
  type Query {
    user: User
  }
  type User {
    id: ID!
    name: String!
  }
`;

describe('externalDocuments', () => {
  it('Dedupes documents by location + hash', async () => {
    const basePath = path.join(__dirname, 'codegen.config.externalDocuments');

    let receivedDocuments: Types.DocumentFile[];
    await executeCodegen({
      schema: SIMPLE_TEST_SCHEMA,
      documents: [
        path.join(basePath, 'file*.graphql.ts'),
        path.join(basePath, 'external2.graphql.ts'),
      ],
      pluginLoader: () => {
        return {
          plugin: (_schema, documents) => {
            receivedDocuments = documents;
            return { content: '' };
          },
        };
      },
      externalDocuments: [path.join(basePath, 'external1.graphql.ts')],
      generates: {
        'out1/generated.ts': {
          plugins: ['test'],
        },
      },
    });

    expect(receivedDocuments.length).toBe(5);

    const file1 = receivedDocuments.find(d => d.location.includes('file1.graphql.ts'));
    expect(file1.type).toBe('standard');
    expect(file1.rawSDL).toMatchInlineSnapshot(`
      "
        query Root {
          user {
            id
          }
        }
      "
    `);

    const file2 = receivedDocuments.find(d => d.location.includes('file2.graphql.ts'));
    expect(file2.type).toBe('standard');
    expect(file2.rawSDL).toMatchInlineSnapshot(`
      "
        query User {
          user {
            ...UserFragment
          }
        }
      "
    `);

    const file3 = receivedDocuments.find(d => d.location.includes('file3.graphql.ts'));
    expect(file3.type).toBe('standard');
    expect(file3.rawSDL).toMatchInlineSnapshot(`
      "
        fragment UserFragment on User {
          name
        }
      "
    `);

    const external1 = receivedDocuments.find(d => d.location.includes('external1.graphql.ts'));
    expect(external1.type).toBe('external');
    expect(external1.rawSDL).toMatchInlineSnapshot(`
      "
        fragment UserFragment on User {
          name
        }
      "
    `);

    const external2 = receivedDocuments.find(d => d.location.includes('external2.graphql.ts'));
    expect(external2.type).toBe('standard');
    expect(external2.rawSDL).toMatchInlineSnapshot(`
      "
        fragment UserFragment2 on User {
          name
        }
      "
    `);
  });

  it('should pass externalDocuments to preset buildGeneratesSection', async () => {
    let capturedExternalDocuments: Types.DocumentFile[] | undefined;

    const capturePreset: Types.OutputPreset = {
      buildGeneratesSection: options => {
        capturedExternalDocuments = options.documents.filter(d => d.type === 'external');
        return [
          {
            filename: 'out1/result.ts',
            pluginMap: { typescript: require('@graphql-codegen/typescript') },
            plugins: [{ typescript: {} }],
            schema: options.schema,
            documents: options.documents,
            config: options.config,
          },
        ];
      },
    };

    await executeCodegen({
      schema: SIMPLE_TEST_SCHEMA,
      documents: `query root { user { id } }`,
      externalDocuments: `query readOnlyQuery { user { id } }`,
      generates: {
        'out1/': { preset: capturePreset },
      },
    });

    expect(capturedExternalDocuments).toBeDefined();
    expect(capturedExternalDocuments).toHaveLength(1);
  });

  it('should not include externalDocuments content in regular documents', async () => {
    let capturedDocuments: Types.DocumentFile[] | undefined;
    let capturedExternalDocuments: Types.DocumentFile[] | undefined;

    const capturePreset: Types.OutputPreset = {
      buildGeneratesSection: options => {
        capturedDocuments = options.documents.filter(d => d.type === 'standard');
        capturedExternalDocuments = options.documents.filter(d => d.type === 'external');
        return [
          {
            filename: 'out1/result.ts',
            pluginMap: { typescript: require('@graphql-codegen/typescript') },
            plugins: [{ typescript: {} }],
            schema: options.schema,
            documents: options.documents,
            config: options.config,
          },
        ];
      },
    };

    await executeCodegen({
      schema: SIMPLE_TEST_SCHEMA,
      documents: `query root { user { id } }`,
      externalDocuments: `query readOnlyQuery { user { id } }`,
      generates: {
        'out1/': { preset: capturePreset },
      },
    });

    expect(capturedDocuments).toHaveLength(1);
    expect(capturedExternalDocuments).toHaveLength(1);

    const documentNames = capturedDocuments.flatMap(
      d => d.document?.definitions.map((def: any) => def.name?.value) ?? [],
    );
    const readOnlyNames = capturedExternalDocuments.flatMap(
      d => d.document?.definitions.map((def: any) => def.name?.value) ?? [],
    );

    expect(documentNames).toContain('root');
    expect(documentNames).not.toContain('readOnlyQuery');
    expect(readOnlyNames).toContain('readOnlyQuery');
    expect(readOnlyNames).not.toContain('root');
  });

  it('should not include externalDocuments operations in non-preset plugin output', async () => {
    const { result } = await executeCodegen({
      schema: SIMPLE_TEST_SCHEMA,
      documents: `query root { user { id } }`,
      externalDocuments: `query readOnlyQuery { user { id } }`,
      generates: {
        'out1.ts': { plugins: ['typescript-operations'] },
      },
    });

    expect(result).toHaveLength(1);
    // Only the regular document operation should be generated
    expect(result[0].content).toContain('RootQuery');
    expect(result[0].content).not.toContain('ReadOnlyQuery');
  });

  it('should support output-level externalDocuments', async () => {
    let capturedExternalDocuments: Types.DocumentFile[] | undefined;

    const capturePreset: Types.OutputPreset = {
      buildGeneratesSection: options => {
        capturedExternalDocuments = options.documents.filter(d => d.type === 'external');
        return [
          {
            filename: 'out1/result.ts',
            pluginMap: { typescript: require('@graphql-codegen/typescript') },
            plugins: [{ typescript: {} }],
            schema: options.schema,
            documents: options.documents,
            config: options.config,
          },
        ];
      },
    };

    await executeCodegen({
      schema: SIMPLE_TEST_SCHEMA,
      generates: {
        'out1/': {
          preset: capturePreset,
          externalDocuments: `fragment Frag on User { id }`,
        },
      },
    });

    expect(capturedExternalDocuments).toHaveLength(1);
  });

  it('should merge root and output-level externalDocuments', async () => {
    let capturedExternalDocuments: Types.DocumentFile[] | undefined;

    const capturePreset: Types.OutputPreset = {
      buildGeneratesSection: options => {
        capturedExternalDocuments = options.documents.filter(d => d.type === 'external');
        return [
          {
            filename: 'out1/result.ts',
            pluginMap: { typescript: require('@graphql-codegen/typescript') },
            plugins: [{ typescript: {} }],
            schema: options.schema,
            documents: options.documents,
            config: options.config,
          },
        ];
      },
    };

    await executeCodegen({
      schema: SIMPLE_TEST_SCHEMA,
      externalDocuments: `fragment RootFrag on User { id }`,
      generates: {
        'out1/': {
          preset: capturePreset,
          externalDocuments: `fragment OutputFrag on User { name }`,
        },
      },
    });

    expect(capturedExternalDocuments).toHaveLength(2);
  });
});
