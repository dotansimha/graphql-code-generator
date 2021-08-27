import { NormalizedScalarsMap } from './types';

export const DEFAULT_SCALARS: NormalizedScalarsMap = {
  ID: 'string',
  String: 'string',
  Boolean: 'boolean',
  Int: 'number',
  Float: 'number',
};

export const DEFAULT_RESOLVERS_INTERNAL_SCALARS: NormalizedScalarsMap = {
  ID: 'string',
  Int: 'number',
  Float: 'number',
  String: 'string',
  Boolean: 'boolean',
};

export const DEFAULT_RESOLVERS_EXTERNAL_SCALARS: NormalizedScalarsMap = {
  ID: 'string | number',
  Int: 'number',
  Float: 'number',
  String: 'string',
  Boolean: 'boolean',
};

export const DEFAULT_OPERATIONS_INPUT_SCALARS: NormalizedScalarsMap = {
  ID: 'string | number',
  Int: 'number',
  Float: 'number',
  String: 'string',
  Boolean: 'boolean',
};

export const DEFAULT_OPERATIONS_OUTPUT_SCALARS: NormalizedScalarsMap = {
  ID: 'string',
  Int: 'number',
  Float: 'number',
  String: 'string',
  Boolean: 'boolean',
};
