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

export const main = async () => {
  const cwd = process.cwd();

  const localSchemaFilePath = `${cwd}/schema.graphql`;

  const includes = ['src'];

  const generatePaths: { [scanPath: string]: Types.ConfiguredOutput } = {};

  // Prepare the required structure for GraphQL Codegen
  includes.forEach((include: string) => {
    generatePaths[include] = {
      preset: 'near-operation-file', // This preset tells the codegen to generate multiple files instead of one
      presetConfig: {
        extension: '.ts',
        folder: GENERATED, // Output folder for generated files
        importTypesNamespace: '', // Disable namespace prefix on imported types
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

  await generate({
    schema: localSchemaFilePath,
    documents: [...includes.map((include: any) => `${include}/**/*.{js,jsx,ts,tsx}`), `!**/${GENERATED}/**`],
    config: GRAPHQL_CODEGEN_CONFIG,
    generates: generatePaths,
    silent: false,
    overwrite: true,
    debug: false,
    verbose: false,
  });
};

if (import.meta.url === process.argv[1] || import.meta.url === `file://${process.argv[1]}`) {
  main().catch(e => {
    console.error(e);
    process.exit(1);
  });
}
