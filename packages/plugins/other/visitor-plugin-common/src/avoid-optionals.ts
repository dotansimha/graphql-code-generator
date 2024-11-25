import { AvoidOptionalsConfig, NormalizedAvoidOptionalsConfig } from './types.js';

export const DEFAULT_AVOID_OPTIONALS: NormalizedAvoidOptionalsConfig = {
  object: false,
  inputValue: false,
  field: false,
  defaultValue: false,
  resolvers: false,
  query: false,
  mutation: false,
  subscription: false,
};

export function normalizeAvoidOptionals(
  avoidOptionals?: boolean | AvoidOptionalsConfig
): NormalizedAvoidOptionalsConfig {
  if (typeof avoidOptionals === 'boolean') {
    return {
      object: avoidOptionals,
      inputValue: avoidOptionals,
      field: avoidOptionals,
      defaultValue: avoidOptionals,
      resolvers: avoidOptionals,
      query: avoidOptionals,
      mutation: avoidOptionals,
      subscription: avoidOptionals,
    };
  }

  return {
    ...DEFAULT_AVOID_OPTIONALS,
    ...avoidOptionals,
  };
}
