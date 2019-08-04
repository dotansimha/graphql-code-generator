import { ScalarsMap } from '@graphql-codegen/visitor-plugin-common';

export const DEFAULT_SCALARS: ScalarsMap = {
  ID: 'string',
  String: 'string',
  Boolean: 'boolean',
  Int: 'number',
  Float: 'number',
};

export function normalizeScalars(scalars: ScalarsMap): ScalarsMap {
  return Object.keys(scalars).reduce(
    (prev, key) => {
      return {
        ...prev,
        [key]: typeof scalars[key] === 'object' ? JSON.stringify(scalars[key]) : scalars[key],
      };
    },
    {} as ScalarsMap
  );
}
