/**
 * This version of AvoidOptionalsConfig is an alternative and cut down version of the type of the same name in `@graphql-codegen/visitor-plugins-common`
 * This version only deal with types available in client use cases.
 */
export interface AvoidOptionalsConfig {
  variableValue?: boolean;
  inputValue?: boolean;
  defaultValue?: boolean;
}
export type NormalizedAvoidOptionalsConfig = Required<AvoidOptionalsConfig>;

export const normalizeAvoidOptionals = (
  avoidOptionals?: boolean | AvoidOptionalsConfig
): NormalizedAvoidOptionalsConfig => {
  const defaultAvoidOptionals: NormalizedAvoidOptionalsConfig = {
    variableValue: false,
    inputValue: false,
    defaultValue: false,
  };

  if (typeof avoidOptionals === 'boolean') {
    return {
      variableValue: avoidOptionals,
      inputValue: avoidOptionals,
      defaultValue: avoidOptionals,
    };
  }

  return {
    ...defaultAvoidOptionals,
    ...avoidOptionals,
  };
};
