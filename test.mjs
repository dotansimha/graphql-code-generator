// @ts-check
import { generate } from './packages/graphql-codegen-cli/dist/esm/index.js';
import path from 'node:path';

export async function runCodegen(schemaStr, outputDir) {
  try {
    await generate(
      {
        ignoreNoDocuments: true,
        overwrite: true,
        schema: schemaStr,
        documents: [
          './dev-test/gql-tag-operations/src/index.ts',
          './dev-test/gql-tag-operations/src/bar.ts',
          './dev-test/gql-tag-operations-masking/src/**/*.tsx',
        ],
        verbose: false,
        generates: {
          [outputDir]: {
            preset: 'client',
            presetConfig: {
              persistedDocuments: true,
            },
            plugins: ['typescript-resolvers'],
          },
        },
      },
      true
    );
    console.log('\ncodegen was successful');
  } catch (e) {
    console.log('\ncodegen failed');
  }
}

runCodegen(
  path.join(process.cwd(), 'dev-test/gql-tag-operations/schema.graphql'),
  path.join(process.cwd(), 'testing-saihaj/src/')
);
