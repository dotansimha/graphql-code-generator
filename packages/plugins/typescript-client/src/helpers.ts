import { getFieldType } from 'graphql-codegen-typescript-common';
import { SafeString } from 'handlebars';
import {
  Field,
  Operation,
  SelectionSetFragmentSpread,
  SelectionSetInlineFragment,
  Fragment
} from 'graphql-codegen-core';

// it's not a config.interfacePrefix, it's document related
export function shouldHavePrefix(field: Field, options: Handlebars.HelperOptions) {
  const config = options.data.root.config || {};
  const nonPrefixable = field.isEnum || field.isScalar;

  return config.noNamespaces === true && !isPrimitiveType(field, options) && !nonPrefixable;
}

export function isPrimitiveType(type: Field, options: Handlebars.HelperOptions) {
  return options.data.root.primitives[type.type];
}

function nameFragment(
  convert: (str: string, kind: string) => string,
  prefix: string,
  fragment: SelectionSetFragmentSpread | SelectionSetInlineFragment,
  noNamespaces: boolean
) {
  if (isFragmentSpread(fragment)) {
    return convert(fragment.fragmentName, 'typeNames') + (noNamespaces ? '' : '.') + 'Fragment';
  }

  return (noNamespaces ? convert(prefix, 'typeNames') : '') + fragment.name;
}

function isFragmentSpread(
  fragment: SelectionSetFragmentSpread | SelectionSetInlineFragment
): fragment is SelectionSetFragmentSpread {
  return fragment.isFragmentSpread;
}

export function fragments(convert: (str: string) => string) {
  return (operation: Operation, prefix: string, fragments: Fragment[], options: Handlebars.HelperOptions): string => {
    const config = options.data.root.config || {};
    const noNamespaces = config.noNamespaces === true;
    const fragmentsByType: {
      [type: string]: Array<string>;
    } = {};

    operation.inlineFragments.forEach(fragment => {
      const type = fragment.onType;

      if (!fragmentsByType[type]) {
        fragmentsByType[type] = [];
      }
      fragmentsByType[type].push(nameFragment(convert, prefix, fragment, noNamespaces));
    });

    operation.fragmentsSpread.forEach(fragment => {
      const def = fragments.find(f => f.name === fragment.fragmentName);

      if (!def) {
        throw new Error(
          `A fragment spread you used "${
            fragment.fragmentName
          }" could not found. Please make sure that it's loaded as a GraphQL document!`
        );
      }

      if (!fragmentsByType[def.onType]) {
        fragmentsByType[def.onType] = [];
      }
      fragmentsByType[def.onType].push(nameFragment(convert, prefix, fragment, noNamespaces));
    });

    const mergedFragments = Object.values(fragmentsByType)
      // (F1 & F1)
      .map(names => {
        const joined = names.join(' & ');

        return names.length > 1 ? `(${joined})` : joined;
      })
      // (F1 & F2) | (F3 & F4)
      .join(' | ');

    const output: string[] = [];

    if (mergedFragments && operation.hasFields) {
      output.push(' & ');
    }

    if (Object.keys(fragmentsByType).length > 1) {
      output.push(`(${mergedFragments})`);
    } else {
      output.push(mergedFragments);
    }

    return output.join('');
  };
}

export function convertedFieldType(convert) {
  return (field: Field, prefix: string, options: Handlebars.HelperOptions) => {
    const config = options.data.root.config || {};
    let realType = '';
    const primitiveType = isPrimitiveType(field, options);

    if (shouldHavePrefix(field, options)) {
      realType = convert(prefix, 'typeNames');

      if (config.noNamespaces) {
        realType += field.type;
      }
    } else if (primitiveType) {
      realType = primitiveType;
    } else if (field.isEnum) {
      realType = (config.interfacePrefix || '') + convert(field.type, 'typeNames');
    } else {
      realType = convert(field.type, 'typeNames');
    }

    return new SafeString(getFieldType(field, realType, options));
  };
}
