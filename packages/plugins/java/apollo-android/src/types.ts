export type ImportsSet = Set<string>;

export type TransformedType = {
  isNonNull: boolean;
  baseType: string;
  javaType: string;
  typeToUse: string;
  annotation: string;
};
