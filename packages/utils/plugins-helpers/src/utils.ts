import {
  GraphQLList,
  GraphQLNamedType,
  GraphQLNonNull,
  GraphQLOutputType,
  isListType,
  isNonNullType,
} from 'graphql';
import { Types } from './types.js';

export function mergeOutputs(content: Types.PluginOutput | Array<Types.PluginOutput>): string {
  let mergedContent = '';
  const prepend: Array<string | null> = [];
  const append: Array<string | null> = [];

  if (Array.isArray(content)) {
    for (const item of content) {
      if (typeof item === 'string') {
        mergedContent += item;
      } else {
        mergedContent += item.content;
        prepend.push(...(item.prepend || []));
        append.push(...(item.append || []));
      }
    }
  }

  return [...prepend, mergedContent, ...append].join('\n');
}

export function isWrapperType(t: GraphQLOutputType): t is GraphQLNonNull<any> | GraphQLList<any> {
  return isListType(t) || isNonNullType(t);
}

export function getBaseType(type: GraphQLOutputType): GraphQLNamedType {
  if (isWrapperType(type)) {
    return getBaseType(type.ofType);
  }
  return type;
}

export function removeNonNullWrapper(type: GraphQLOutputType): GraphQLOutputType {
  return isNonNullType(type) ? type.ofType : type;
}
