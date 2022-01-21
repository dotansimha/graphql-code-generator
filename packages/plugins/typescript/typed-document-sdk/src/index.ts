import { Types, PluginValidateFn, PluginFunction } from '@graphql-codegen/plugin-helpers';
import { GraphQLSchema, isEnumType, isObjectType, isScalarType } from 'graphql';
import { buildObjectTypeSelectionString } from './buildObjectTypeSelectionString';
import { buildSDKObjectString } from './buildSDKObjectString';
import { TypedDocumentSDKConfig } from './config';
import { importsString, contentsString } from './sdk-static';

export const plugin: PluginFunction<TypedDocumentSDKConfig> = (
  schema: GraphQLSchema,
  _: Types.DocumentFile[],
  _config: TypedDocumentSDKConfig
) => {
  const contents: Array<string> = [contentsString];
  const inputTypeMap: Array<string> = [];

  for (const graphQLType of Object.values(schema.getTypeMap())) {
    // selection set objects
    if (isObjectType(graphQLType)) {
      contents.push(buildObjectTypeSelectionString(graphQLType));
    }
    // input types
    if (isScalarType(graphQLType) || isEnumType(graphQLType) || isScalarType(graphQLType)) {
      inputTypeMap.push(graphQLType.name, graphQLType.name);
    }
  }

  contents.push(`type SDKInputTypes =${inputTypeMap.join(`\n  | `)}`);

  // sdk object
  contents.push(buildSDKObjectString(schema.getQueryType(), schema.getMutationType(), schema.getSubscriptionType()));

  return {
    prepend: [importsString],
    content: contents.join(`\n\n`),
  };
};

export const validate: PluginValidateFn<TypedDocumentSDKConfig> = async () => {};

export { TypedDocumentSDKConfig };
