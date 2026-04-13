export interface OperationAvoidOptionalsConfig {
  variableValue?: boolean;
  inputValue?: boolean;
  defaultValue?: boolean;
}
export type NormalizedOperationAvoidOptionalsConfig = Required<OperationAvoidOptionalsConfig>;

export const normalizeOperationAvoidOptionals = (
  avoidOptionals: boolean | OperationAvoidOptionalsConfig,
): NormalizedOperationAvoidOptionalsConfig => {
  const defaultAvoidOptionals: NormalizedOperationAvoidOptionalsConfig = {
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
