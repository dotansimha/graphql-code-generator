import { getFieldType } from 'graphql-codegen-typescript-common';
import { SafeString } from 'handlebars';
import {
  Field,
  Operation,
  SelectionSetFragmentSpread,
  SelectionSetInlineFragment,
  Fragment,
  SelectionSetFieldNode
} from 'graphql-codegen-core';

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
    } else {
      realType = convert(field.type, 'typeNames');
    }

    return new SafeString(getFieldType(field, realType, options));
  };
}

export function mergeFragments (obj: SelectionSetFieldNode, options: Handlebars.HelperOptions) {
  const parseInlineFragment = (obj: SelectionSetFieldNode) => {
    const { inlineFragments } = obj;
    const fields = inlineFragments.map(({fields}) => fields);
    const concatFields = obj.fields.concat(...fields);
    const result = {...obj, fields: concatFields, hasFields: true, hasInlineFragments: false, inlineFragments: []};
    return result;
  };
  const parseFragmentSpreadEntries = (obj: SelectionSetFragmentSpread, fragments: SelectionSetInlineFragment[]) => {
    const [fragment] = fragments.filter(f => f.name === obj.fragmentName);
    return fragment.fields;
  };
  const parseFragmentSpread = (obj: SelectionSetFieldNode, fragments: SelectionSetInlineFragment[]) => {
    const { fragmentsSpread } = obj;
    const fragmentFields = fragmentsSpread.map(fragmentSpread => parseFragmentSpreadEntries(fragmentSpread, fragments));
    const concatFields = obj.fields.concat(...fragmentFields);
    const result = {...obj, fields: concatFields, hasFields: true, hasFragmentsSpread: false, fragmentsSpread: []};
    return result;

  };
  const parseFields = (fields: SelectionSetFieldNode[], index: number, fieldParsed: SelectionSetFieldNode | any) => {
    const fieldsArr = [...fields[index].fields, ...fieldParsed.fields];
    const fieldsParsed = Object.values(fieldsArr.reduce((acc, field) => {
      acc[field.name] = field;
      return acc;
    }, {}));
    fields[index] = {...fieldParsed, fields: fieldsParsed};
  };

  const mergeFragmentsFields = (fields: SelectionSetFieldNode[], fragments: SelectionSetInlineFragment[]) => {
    fields.forEach((field: any, index) => {
      if (field.hasFields) {
        mergeFragmentsFields(field.fields, fragments);
      }
      if (field.hasInlineFragments) {
        const fieldParsed = parseInlineFragment(field);
        parseFields(fields, index, fieldParsed);
      }
      if (field.hasFragmentsSpread) {
        const fieldParsed = parseFragmentSpread(field, fragments);
        parseFields(fields, index, fieldParsed);
      }
    });
    return fields;
  };

  const mergeFragmentsRoot = (obj: SelectionSetFieldNode, fragments: (SelectionSetFragmentSpread[] | SelectionSetInlineFragment[] | any)) => {
    if (obj.hasFields) {
      obj.fields = mergeFragmentsFields(obj.fields, fragments);
    } else if (obj.hasInlineFragments) {
      obj = parseInlineFragment(obj);
    } else if (obj.hasFragmentsSpread) {
      obj = parseFragmentSpread(obj, fragments);
    }
    return obj;
  };
  mergeFragmentsRoot(obj, options.data.root.fragments);
}
