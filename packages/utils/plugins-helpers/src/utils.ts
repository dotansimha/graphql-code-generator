import { GraphQLOutputType, GraphQLNamedType, GraphQLNonNull, GraphQLList, isListType, isNonNullType } from 'graphql';
import { Types } from './types.js';

export function mergeOutputs(content: Types.PluginOutput | Array<Types.PluginOutput>): string {
  const result: Types.ComplexPluginOutput = { content: '', prepend: [], append: [] };

  if (Array.isArray(content)) {
    content.forEach(item => {
      if (typeof item === 'string') {
        result.content += item;
      } else {
        result.content += item.content;
        result.prepend.push(...(item.prepend || []));
        result.append.push(...(item.append || []));
      }
    });
  }

  return [...result.prepend, result.content, ...result.append].join('\n');
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
