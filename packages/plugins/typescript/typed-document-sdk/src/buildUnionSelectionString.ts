import { stripIndent } from 'common-tags';
import type { GraphQLUnionType } from 'graphql';
import { buildSelectionSetName } from './buildObjectTypeSelectionString';

export const buildUnionSelectionString = (ttype: GraphQLUnionType) => {
  const implementedTypes = ttype.getTypes().map(ttype => `"...${ttype.name}": ${buildSelectionSetName(ttype.name)};`);

  return stripIndent`
    type ${buildSelectionSetName(ttype.name)} = SDKSelectionSet<{
      ${implementedTypes.join(`\n      `)}
    }>;
  `;
};
