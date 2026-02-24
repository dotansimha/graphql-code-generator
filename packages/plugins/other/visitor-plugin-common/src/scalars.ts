import { NormalizedScalarsMap } from './types.js';

export const DEFAULT_SCALARS: NormalizedScalarsMap = {
  ID: {
    input: 'string',
    output: 'string',
  },
  String: {
    input: 'string',
    output: 'string',
  },
  Boolean: {
    input: 'boolean',
    output: 'boolean',
  },
  Int: {
    input: 'number',
    output: 'number',
  },
  Float: {
    input: 'number',
    output: 'number',
  },
};

export const DEFAULT_INPUT_SCALARS: NormalizedScalarsMap = {
  ID: {
    input: 'string | number',
    output: 'string',
  },
  String: {
    input: 'string',
    output: 'string',
  },
  Boolean: {
    input: 'boolean',
    output: 'boolean',
  },
  Int: {
    input: 'number',
    output: 'number',
  },
  Float: {
    input: 'number',
    output: 'number',
  },
};
