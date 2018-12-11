import { BasicFlowVisitor, FlowPluginConfig, ScalarsMap } from 'graphql-codegen-flow';
import { ObjectTypeDefinitionNode } from 'graphql/language/ast';

export interface ParsedConfig {}

export class FlowResolversVisitor implements BasicFlowVisitor {
  private _parsedConfig: ParsedConfig;

  constructor(pluginConfig: FlowPluginConfig) {
    this._parsedConfig = {};
  }

  get scalars(): ScalarsMap {
    return {};
  }

  ObjectTypeDefinition = (node: ObjectTypeDefinitionNode) => {
    return '';
  };
}
