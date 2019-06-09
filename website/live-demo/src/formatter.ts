import { Types } from '@graphql-codegen/plugin-helpers';

export const EXT_TO_FORMATTER: { [extension: string]: string } = {
  ts: 'typescript',
  'd.ts': 'typescript',
  tsx: 'typescript',
  graphql: 'graphql',
  json: 'json',
  java: 'java',
  js: 'javascript',
  jsx: 'javascript',
};

export function getMode(config: Types.Config): string {
  const out = Object.keys(config.generates)[0].split('.');
  const ext = out[out.length - 1];

  return EXT_TO_FORMATTER[ext];
}
