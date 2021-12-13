// This file is bundled and inlined.
// We should probably make this a shared package though.
// eslint-disable-next-line import/no-extraneous-dependencies
import { NameNode } from 'graphql';

/**
 * C# keywords
 * https://docs.microsoft.com/en-us/dotnet/csharp/language-reference/keywords/
 */
const csharpKeywords = new Set([
  'abstract',
  'as',
  'base',
  'bool',
  'break',
  'byte',
  'case',
  'catch',
  'char',
  'checked',
  'class',
  'const',
  'continue',
  'decimal',
  'default',
  'delegate',
  'do',
  'double',
  'else',
  'enum',
  'event',
  'explicit',
  'extern',
  'false',
  'finally',
  'fixed',
  'float',
  'for',
  'foreach',
  'goto',
  'if',
  'implicit',
  'in',
  'int',
  'interface',
  'internal',
  'is',
  'lock',
  'long',
  'namespace',
  'new',
  'null',
  'object',
  'operator',
  'out',
  'override',
  'params',
  'private',
  'protected',
  'public',
  'readonly',
  'record',
  'ref',
  'return',
  'sbyte',
  'sealed',
  'short',
  'sizeof',
  'stackalloc',
  'static',
  'string',
  'struct',
  'switch',
  'this',
  'throw',
  'true',
  'try',
  'typeof',
  'uint',
  'ulong',
  'unchecked',
  'unsafe',
  'ushort',
  'using',
  'virtual',
  'void',
  'volatile',
  'while',
]);

/**
 * Checks name against list of keywords. If it is, will prefix value with @
 *
 * Note:
 * This class should first invoke the convertName from base-visitor to convert the string or node
 * value according the naming configuration, eg upper or lower case. Then resulting string checked
 * against the list or keywords.
 * However the generated C# code is not yet able to handle fields that are in a different case so
 * the invocation of convertName is omitted purposely.
 */
export function convertSafeName(node: NameNode | string): string {
  const name = typeof node === 'string' ? node : node.value;
  return csharpKeywords.has(name) ? `@${name}` : name;
}
