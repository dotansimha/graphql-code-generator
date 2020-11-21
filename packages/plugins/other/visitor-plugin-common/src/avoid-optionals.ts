import { AvoidOptionalsConfig } from './types';

export const DEFAULT_AVOID_OPTIONALS: AvoidOptionalsConfig = {
  object: false,
  inputValue: false,
  field: false,
  defaultValue: false,
};

export function normalizeAvoidOptionals(avoidOptionals?: boolean | AvoidOptionalsConfig): AvoidOptionalsConfig {
  if (typeof avoidOptionals === 'boolean') {
    return {
      object: avoidOptionals,
      inputValue: avoidOptionals,
      field: avoidOptionals,
      defaultValue: avoidOptionals,
    };
  }

  return {
    ...DEFAULT_AVOID_OPTIONALS,
    ...avoidOptionals,
  };
}
