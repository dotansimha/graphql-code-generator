#!/usr/bin/env ts-node

import path from 'path';
import { uniq } from 'lodash-es';
import { generate } from '@graphql-codegen/cli';
import type { Types } from '@graphql-codegen/plugin-helpers';
import deleteAsync from 'del';

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
  skipTypename: false,
  useTypeImports: true,
  preResolveTypes: true, // Simplifies the generated types
  namingConvention: 'keep', // Keeps naming as-is
  avoidOptionals: false, // Allow '?' on variables fields
  nonOptionalTypename: true, // Forces `__typename` on all selection sets
  skipTypeNameForRoot: true, // Don't generate __typename for root types
  omitOperationSuffix: true, // Don't add 'Query', 'Mutation' or 'Subscription' suffixes to operation result types
  fragmentSuffix: '', // Don't add 'Fragment' suffix to fragment result types
  extractAllFieldsToTypesCompact: true, // Extracts all fields to separate types (similar to apollo-codegen behavior)
  printFieldsOnNewLines: true, // Prints each field on a new line (similar to apollo-codegen behavior)
  importTypesNamespace: '', // Disable namespace prefix on imported types
  enumType: 'native',
  generatesOperationTypes: true,
  defaultScalarType: 'any',
  maybeValue: 'T | null',
  inputMaybeValue: 'T | null',
};

export const main = async () => {
  const cwd = process.cwd();

  await deleteAsync([`src/**/${GENERATED}`], { cwd });

  const localSchemaFilePath = `${cwd}/schema.graphql`;

  const includes = ['src'];

  const generateFiles: { [scanPath: string]: Types.ConfiguredOutput } = {};

  // Prepare the required structure for GraphQL Codegen
  includes.forEach((include: string) => {
    generateFiles[include] = {
      preset: 'near-operation-file', // This preset tells the codegen to generate multiple files instead of one
      presetConfig: {
        extension: '.ts', //  Matches the existing Apollo-Codegen file naming
        // FIXME: The following config is required, but it is not needed with the recent version of typescript-operations.
        // So - when the new version of near-operation-file' is available - fix this.
        baseTypesPath: 'unused',
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

  await generate(
    {
      schema: localSchemaFilePath,
      documents: [
        // matching js extensins as well - there are cases where js files are not converted to typescript yet
        // (but the package is typescript)
        ...includes.map((include: any) => `${include}/**/*.{js,jsx,ts,tsx}`),
        `!**/${GENERATED}/**`,
      ],
      config: GRAPHQL_CODEGEN_CONFIG,
      generates: generateFiles,
      silent: true,
    },
    true // overwrite existing files
  );
};

if (import.meta.url === process.argv[1] || import.meta.url === `file://${process.argv[1]}`) {
  main().catch(e => {
    console.error(e);
    process.exit(1);
  });
}
