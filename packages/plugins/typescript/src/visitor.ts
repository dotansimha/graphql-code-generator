import { BaseVisitor } from 'graphql-codegen-visitor-plugin-common';
import { TypeScriptPluginConfig } from './index';
import * as autoBind from 'auto-bind';

export class TsVisitor extends BaseVisitor {
  constructor(pluginConfig: TypeScriptPluginConfig) {
    super(pluginConfig, null);

    autoBind(this);
  }
}
