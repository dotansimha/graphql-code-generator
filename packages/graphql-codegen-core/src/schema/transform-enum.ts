import { GraphQLEnumType, GraphQLEnumValue, GraphQLSchema } from 'graphql';
import { Enum, EnumValue } from '../types';
import { debugLog } from '../debugging';
import { getDirectives } from 'graphql-toolkit';

export function transformGraphQLEnum(schema: GraphQLSchema, graphqlEnum: GraphQLEnumType): Enum {
  debugLog(`[transformGraphQLEnum] transformed enum ${graphqlEnum.name}`);
  const directives = getDirectives(schema, graphqlEnum);

  const enumValues = graphqlEnum.getValues().map<EnumValue>((enumItem: GraphQLEnumValue) => {
    const valueDirectives = getDirectives(schema, enumItem);

    return <EnumValue>{
      name: enumItem.name,
      description: enumItem.description || '',
      value: enumItem.value,
      directives: valueDirectives,
      usesDirectives: Object.keys(valueDirectives).length > 0
    };
  });

  return {
    name: graphqlEnum.name,
    description: graphqlEnum.description || '',
    values: enumValues,
    directives,
    usesDirectives: Object.keys(directives).length > 0
  };
}
