/**
 * maps GraphQL scalar types to Dart's scalar types
 */
export const DART_SCALARS: Record<string, string> = {
  ID: 'String',
  String: 'String',
  Boolean: 'bool',
  Int: 'int',
  Float: 'double',
  DateTime: 'DateTime',
};
