import { GraphQLEnumType, GraphQLEnumValue, GraphQLSchema } from 'graphql';
import { Enum, EnumValue } from '../types';
import { debugLog } from '../debugging';
import { getDirectives } from '../utils/get-directives';

export function transformGraphQLEnum(schema: GraphQLSchema, graphqlEnum: GraphQLEnumType): Enum {
  debugLog(`[transformGraphQLEnum] transformed enum ${graphqlEnum.name}`);
  const directives = getDirectives(schema, graphqlEnum);

  const enumValues = graphqlEnum.getValues().map<EnumValue>((enumItem: GraphQLEnumValue) => {
    return <EnumValue>{
      name: enumItem.name,
      description: enumItem.description || '',
      value: enumItem.value
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
