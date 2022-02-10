import { stripIndent } from 'common-tags';
import type { GraphQLInterfaceType, GraphQLSchema } from 'graphql';
import { buildObjectArgumentsName } from './buildObjectTypeArgumentString';

export const buildInterfaceArgumentString = (schema: GraphQLSchema, ttype: GraphQLInterfaceType) => {
  const implementedTypes = schema
    .getImplementations(ttype)
    .objects.map(ttype => `"...${ttype.name}": ${buildObjectArgumentsName(ttype.name)};`);

  return stripIndent`
    type ${buildObjectArgumentsName(ttype.name)} = SDKSelectionSet<{
      ${implementedTypes.join(`\n      `)}
    }>;
  `;
};
