import { RawTypesConfig } from '@graphql-codegen/visitor-plugin-common';

/**
 * @description This plugin generates the base Python types, based on your GraphQL schema.
 *
 * This is equivalent of the `typescript` plugin. The generated types are simple, refer to your schema's exact structure, and will be used as the base type for future plugins (such as `python-operations`)
 */
export interface PythonPluginConfig extends RawTypesConfig {}
