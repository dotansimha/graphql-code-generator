import { stripIndent } from 'common-tags';
import type { GraphQLObjectType } from 'graphql';
import { buildSelectionSetName } from './buildObjectTypeSelectionString';
import { buildObjectArgumentsName } from './buildObjectTypeArgumentString';

type Maybe<T> = T | null | undefined;

export const buildSDKObjectString = (
  queryType: Maybe<GraphQLObjectType>,
  mutationType: Maybe<GraphQLObjectType | null>,
  subscriptionType: Maybe<GraphQLObjectType | null>
): string => {
  if (!queryType) {
    throw new TypeError('Query type is missing.');
  }

  return stripIndent`
    export const sdk = createSDK<
      GeneratedSDKInputTypes,
      ${buildSelectionSetName(queryType.name)},
      ${buildObjectArgumentsName(queryType.name)},
      ${queryType.name},
      ${mutationType ? buildSelectionSetName(mutationType.name) : 'void'},
      ${mutationType ? buildObjectArgumentsName(mutationType.name) : 'void'},
      ${mutationType ? mutationType : 'void'},
      ${subscriptionType ? buildSelectionSetName(subscriptionType.name) : 'void'},
      ${subscriptionType ? buildObjectArgumentsName(subscriptionType.name) : 'void'},
      ${subscriptionType ? subscriptionType : 'void'},
    >()
  `;
};
