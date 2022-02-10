import { stripIndent } from 'common-tags';
import type { GraphQLUnionType } from 'graphql';
import { buildObjectArgumentsName } from './buildObjectTypeArgumentString';

export const buildUnionArgumentString = (ttype: GraphQLUnionType) => {
  const implementedTypes = ttype
    .getTypes()
    .map(ttype => `"...${ttype.name}": ${buildObjectArgumentsName(ttype.name)};`);

  return stripIndent`
    type ${buildObjectArgumentsName(ttype.name)} = {
      ${implementedTypes.join(`\n      `)}
    };
  `;
};
