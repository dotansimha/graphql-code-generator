import { GraphQLEnumType, GraphQLEnumValue } from 'graphql';
import { Enum, EnumValue } from '../types';

export function transformGraphQLEnum(graphqlEnum: GraphQLEnumType): Enum {
  const enumValues = graphqlEnum.getValues().map<EnumValue>((enumItem: GraphQLEnumValue) => {
    return <EnumValue>{
      name: enumItem.name,
      description: enumItem.description,
      value: enumItem.value
    };
  });

  return {
    name: graphqlEnum.name,
    description: graphqlEnum.description,
    values: enumValues,
  };
}
