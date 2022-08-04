import { AvoidOptionalsConfig } from './types.js';

export const DEFAULT_AVOID_OPTIONALS: AvoidOptionalsConfig = {
  object: false,
  inputValue: false,
  field: false,
  defaultValue: false,
  resolvers: false,
};

export function normalizeAvoidOptionals(avoidOptionals?: boolean | AvoidOptionalsConfig): AvoidOptionalsConfig {
  if (typeof avoidOptionals === 'boolean') {
    return {
      object: avoidOptionals,
      inputValue: avoidOptionals,
      field: avoidOptionals,
      defaultValue: avoidOptionals,
      resolvers: avoidOptionals,
    };
  }

  return {
    ...DEFAULT_AVOID_OPTIONALS,
    ...avoidOptionals,
  };
}
