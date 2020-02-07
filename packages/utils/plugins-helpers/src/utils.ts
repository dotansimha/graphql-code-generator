import { GraphQLOutputType, GraphQLNamedType, GraphQLNonNull, GraphQLList, isListType, isNonNullType, GraphQLField, SchemaMetaFieldDef, TypeMetaFieldDef, TypeNameMetaFieldDef } from 'graphql';
import { Types } from './types';

export function mergeOutputs(content: Types.PluginOutput | Array<Types.PluginOutput>): string {
  let result: Types.ComplexPluginOutput = { content: '', prepend: [], append: [] };

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
  } else {
    return type;
  }
}

type MetaFieldDefs = Record<string, GraphQLField<any, any>>;

const metaFieldDefs: MetaFieldDefs = {
  __schema: SchemaMetaFieldDef,
  __type: TypeMetaFieldDef,
  __typename: TypeNameMetaFieldDef,
};

export function getMetaField(name: string): GraphQLField<any, any> | null {
  if (name in metaFieldDefs) {
    return metaFieldDefs[name as keyof MetaFieldDefs];
  } else {
    return null;
  }
}
