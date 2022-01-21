import { stripIndent } from 'common-tags';
import { GraphQLObjectType } from 'graphql';
import { buildObjectSelectionSetName } from './buildObjectTypeSelectionString';

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
      ${buildObjectSelectionSetName(queryType.name)},
      ${queryType.name},
      ${mutationType ? buildObjectSelectionSetName(mutationType.name) : 'void'},
      ${mutationType ? mutationType : 'void'},
      ${subscriptionType ? buildObjectSelectionSetName(subscriptionType.name) : 'void'},
      ${subscriptionType ? subscriptionType : 'void'},
    >()
  `;
};
