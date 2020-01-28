import { RawClientSideBasePluginConfig } from '@graphql-codegen/visitor-plugin-common';
export interface RawGraphQLRequestPluginConfig extends RawClientSideBasePluginConfig {
  rawRequest?: boolean;
}
