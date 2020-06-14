import { RawTypesConfig } from '@graphql-codegen/visitor-plugin-common';

/**
 * @description This plugin generates the base Python types, based on your GraphQL schema.
 *
 * This is equivalent of the `typescript` plugin. The generated types are simple, refer to your schema's exact structure, and will be used as the base type for future plugins (such as `python-operations`).
 *
 * This package requires Python 3.8+, since that is the first time optionals were introduced. If you do need support for Python 3.6 or 3.5, [let us know](https://github.com/dotansimha/graphql-code-generator/issues/new/choose), and we can try to start supporting that.
 */
export interface PythonPluginConfig
  extends Omit<RawTypesConfig, 'declarationKind' | 'fieldWrapperValue' | 'wrapFieldDefinitions'> {}
