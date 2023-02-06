import { RawTypesConfig } from '@graphql-codegen/visitor-plugin-common';

/**
 * @description This plugin generates the Typescript schema that enables queries and mutations to be typed in the Nhost SDK.
 *
 */
export interface NhostPluginConfig extends Pick<RawTypesConfig, 'scalars'> {}
