#!/usr/bin/env node
import { generate } from '@graphql-codegen/cli';
import { buildCodegenConfig } from './config.ts';

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
