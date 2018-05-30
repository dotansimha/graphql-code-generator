import { GraphQLObjectType, GraphQLSchema } from 'graphql';

export function getImplementingTypes(interfaceName: string, schema: GraphQLSchema): string[] {
  const allTypesMap = schema.getTypeMap();
  const result: string[] = [];

  for (const graphqlType of Object.values(allTypesMap)) {
    if (graphqlType instanceof GraphQLObjectType) {
      const allInterfaces = graphqlType.getInterfaces();

      if (allInterfaces.find(int => int.name === interfaceName)) {
        result.push(graphqlType.name);
      }
    }
  }

  return result;
}
