import { stripIndent } from 'common-tags';
import type { GraphQLInterfaceType, GraphQLSchema } from 'graphql';
import { buildSelectionSetName } from './buildObjectTypeSelectionString';

export const buildInterfaceSelectionString = (schema: GraphQLSchema, ttype: GraphQLInterfaceType) => {
  const implementedTypes = schema
    .getImplementations(ttype)
    .objects.map(ttype => `"...${ttype.name}": ${buildSelectionSetName(ttype.name)};`);

  return stripIndent`
    type ${buildSelectionSetName(ttype.name)} = SDKSelectionSet<{
      ${implementedTypes.join(`\n      `)}
    }>;
  `;
};
