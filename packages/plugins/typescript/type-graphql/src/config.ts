import { DecoratorConfig } from './visitor';
import { TypeScriptPluginConfig } from '@graphql-codegen/typescript';

export interface TypeGraphQLPluginConfig extends TypeScriptPluginConfig {
  decoratorName?: Partial<DecoratorConfig>;
}
