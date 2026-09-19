#!/usr/bin/env ts-node
import { generate } from '@graphql-codegen/cli';
import type { Types } from '@graphql-codegen/plugin-helpers';

export const GENERATED = '__generated__';
export const GLOBAL_TYPES_FILE = 'globalTypes.ts';
export const TS_GENERATED_FILE_HEADER = `\
/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.
`;

/**
 * The following GraphQL Codegen config matches as closely as possible
 * to the old apollo-tooling codegen
 * @see https://github.com/apollographql/apollo-tooling/issues/2053
 * */
const GRAPHQL_CODEGEN_CONFIG = {
  useTypeImports: true,
  namingConvention: 'keep', // Keeps naming as-is
  avoidOptionals: false, // Allow '?' on variables fields
  nonOptionalTypename: true, // Forces `__typename` on all selection sets
  skipTypeNameForRoot: true, // Don't generate __typename for root types
  omitOperationSuffix: true, // Don't add 'Query', 'Mutation' or 'Subscription' suffixes to operation result types
  fragmentSuffix: '', // Don't add 'Fragment' suffix to fragment result types
  extractAllFieldsToTypesCompact: true, // Extracts all fields to separate types (similar to apollo-codegen behavior)
  printFieldsOnNewLines: true, // Prints each field on a new line (similar to apollo-codegen behavior)
  enumType: 'native',
  generateOperationTypes: true,
};

/**
 * Shared by both entry points into this package's codegen:
 * - `main()` below, i.e. the programmatic `start` script, which is what the real
 *   apollo-tooling setup this package mimics does.
 * - `codegen.ts`, which the `generate:{cjs,esm}` scripts feed to the CLI binary so
 *   the dev-tests CI job covers this package the same way it covers the others.
 */
export const buildCodegenConfig = (cwd: string): Types.Config => {
  const localSchemaFilePath = `${cwd}/schema.graphql`;

  const includes = ['src'];

  const generatePaths: { [scanPath: string]: Types.ConfiguredOutput } = {};

  // Prepare the required structure for GraphQL Codegen
  // eslint-disable-next-line unicorn/no-array-for-each
  includes.forEach((include: string) => {
    generatePaths[include] = {
      preset: 'near-operation-file', // This preset tells the codegen to generate multiple files instead of one
      presetConfig: {
        extension: '.ts',
        folder: GENERATED, // Output folder for generated files
      },
      plugins: [
        'typescript-operations',
        {
          add: {
            content: TS_GENERATED_FILE_HEADER,
          },
        },
      ],
    };
  });

  return {
    schema: localSchemaFilePath,
    documents: [
      ...includes.map((include: any) => `${include}/**/*.{js,jsx,ts,tsx}`),
      `!**/${GENERATED}/**`,
    ],
    config: GRAPHQL_CODEGEN_CONFIG,
    generates: generatePaths,
    silent: false,
    overwrite: true,
    debug: false,
    verbose: false,
  };
};

export const main = async () => {
  await generate(buildCodegenConfig(process.cwd()));
};

if (import.meta.url === process.argv[1] || import.meta.url === `file://${process.argv[1]}`) {
  main().catch(e => {
    // eslint-disable-next-line no-console
    console.error(e);
    process.exit(1);
  });
}
