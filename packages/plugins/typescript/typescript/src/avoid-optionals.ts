import { AvoidOptionalsConfig } from './types';

export const DEFAULT_AVIOD_OPTIONALS: AvoidOptionalsConfig = {
  object: false,
  inputValue: false,
};

export function normalizeAvoidOptionals(avoidOptionals?: boolean | AvoidOptionalsConfig): AvoidOptionalsConfig {
  if (typeof avoidOptionals === 'boolean') {
    return {
      object: avoidOptionals,
      inputValue: avoidOptionals,
    };
  }

  return {
    ...DEFAULT_AVIOD_OPTIONALS,
    ...avoidOptionals,
  };
}
