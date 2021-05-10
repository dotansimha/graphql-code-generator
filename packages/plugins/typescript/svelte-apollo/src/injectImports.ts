// The function `injectImports` below helps you to create easy import syntax in you typescript file.

const isString = (item: unknown): item is string => typeof item === 'string';

const isObject = <K extends string | number | symbol = string | number | symbol, V = any>(
  item: unknown
): item is Record<K, V> => !!(item && typeof item === 'object');

const stringSplice = (text: string, start: number, length?: number, ...insert: string[]): string => {
  const _start = start < 0 ? Math.max(0, text.length - start) : Math.min(start, text.length);
  const begin = text.slice(0, _start);
  const middle = insert.join('');
  const last = length === undefined ? '' : text.slice(_start + length);

  return `${begin}${middle}${last}`;
};

const ellipsisQuoted = (text: string, length = 40): string => {
  const _length = Math.max(4, length) - 1;
  const quoted = `${JSON.stringify(text)}`;
  return quoted.length < _length + 2 ? quoted : stringSplice(quoted, _length - 1, quoted.length - _length, '…');
};

const stringShouldMatch = (text: string, rx: RegExp, errorMessage: string): string => {
  if (text.match(rx)) {
    return text;
  }
  throw new Error(errorMessage);
};

const shouldBeVariableName = (text: string): string =>
  stringShouldMatch(text, /^[_A-Za-z]\w*$/, `Syntax error, string ${ellipsisQuoted(text)} is not a variable name`);

/**
 * Function `injectImports` helps you to create `import` syntax in you typescript file.
 * @name injectImports
 * @param {Object} source is a dictionary associating `keys` as paths to `values` as imported variables
 * @param {boolean} isTypeOnly transforms `import` to `import type`.
 * @returns {string[]} imports lines separated by paths.
 *
 * @example
 * // returns [
 * //   'import gql from "graphql-tag"',
 * //   'import type { QueryOptions } from "@apollo/client"',
 * //   'import { getContext as getSvelteContext, setContext } from "svelte"',
 * //   'import "../common"',
 * //   'import * as allStyles from "./styles"'
 * // ];
 * injectImports({
 *   "graphql-tag": "gql",
 *   "@apollo/client": { "type": [ QueryOptions ] },
 *   "svelte": [ { "getContext": "getSvelteContext" }, "setContext" ],
 *   "../common": true,
 *   "./styles": { "*": "allStyles" }
 * });
 */

export default function injectImports<T extends string | Record<string, string> | (string | Record<string, string>)[]>(
  source: Record<string, T>,
  isTypeOnly = false
): string[] {
  const paths = Object.entries(source) as [string, T][];
  const t = isTypeOnly ? 'import type' : 'import';
  return paths.map(([path, value]): string => {
    if (isString(value)) {
      return `${t} ${shouldBeVariableName(value)} from "${path}"`;
    }
    if (Array.isArray(value)) {
      const items = value
        .map((sub): string | void => {
          if (isString(sub)) {
            return shouldBeVariableName(sub);
          }
          if (isObject(sub)) {
            const firstKey = Object.keys(sub)[0];
            return `${shouldBeVariableName(firstKey)} as ${shouldBeVariableName(sub[firstKey])}`;
          }
        })
        .filter(isString);
      if (items.length) {
        return `${t} { ${items.join(', ')} } from "${path}";`;
      }
    } else if (isObject(value)) {
      if (isObject(value.type)) {
        return injectImports({ [path]: value.type }, true)[0];
      }
      if (value['*']) {
        return `${t} * as ${shouldBeVariableName(value['*'])} from "${path}";`;
      }
      const items = Object.entries(value).map(
        ([name, alias]) => `${shouldBeVariableName(name)} as ${shouldBeVariableName(alias)}`
      );
      if (items.length) {
        return `${t} { ${items.join(', ')} } from "${path}";`;
      }
    }
    return `${t} "${path}";`;
  });
}
