import type { Types } from '@graphql-codegen/plugin-helpers';
import { executeCodegen } from '../src/index.js';

const SIMPLE_TEST_SCHEMA = `type MyType { f: String } type Query { f: String }`;

describe('externalDocuments', () => {
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
      documents: `query root { f }`,
      externalDocuments: `fragment Frag on MyType { f }`,
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
      documents: `query root { f }`,
      externalDocuments: `query readOnlyQuery { f }`,
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
      documents: `query root { f }`,
      externalDocuments: `query readOnlyQuery { f }`,
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
          externalDocuments: `fragment Frag on MyType { f }`,
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
      externalDocuments: `fragment RootFrag on MyType { f }`,
      generates: {
        'out1/': {
          preset: capturePreset,
          externalDocuments: `fragment OutputFrag on MyType { f }`,
        },
      },
    });

    expect(capturedExternalDocuments).toHaveLength(2);
  });
});
