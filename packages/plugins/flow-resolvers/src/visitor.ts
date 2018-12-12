import { resolveExternalModuleAndFn } from 'graphql-codegen-plugin-helpers';
import {
  DEFAULT_SCALARS,
  indent,
  toPascalCase,
  DeclarationBlock,
  BasicFlowVisitor,
  ScalarsMap
} from 'graphql-codegen-flow';
import {
  ObjectTypeDefinitionNode,
  FieldDefinitionNode,
  NameNode,
  ListTypeNode,
  NonNullTypeNode,
  NamedTypeNode
} from 'graphql/language/ast';
import { FlowResolversPluginConfig } from './index';

export interface ParsedConfig {
  scalars: ScalarsMap;
  convert: (str: string) => string;
  typesPrefix: string;
  contextType: string;
  mapping: { [typeName: string]: string };
}

export class FlowResolversVisitor implements BasicFlowVisitor {
  private _parsedConfig: ParsedConfig;

  constructor(pluginConfig: FlowResolversPluginConfig, private _subscriptionTypeName: string | null = null) {
    this._parsedConfig = {
      contextType: pluginConfig.contextType || 'any',
      mapping: pluginConfig.mapping || {},
      scalars: { ...DEFAULT_SCALARS, ...(pluginConfig.scalars || {}) },
      convert: pluginConfig.namingConvention ? resolveExternalModuleAndFn(pluginConfig.namingConvention) : toPascalCase,
      typesPrefix: pluginConfig.typesPrefix || ''
    };
  }

  get scalars(): ScalarsMap {
    return this._parsedConfig.scalars;
  }

  private _convertName(name: any, addPrefix = true): string {
    return (addPrefix ? this._parsedConfig.typesPrefix : '') + this._parsedConfig.convert(name);
  }

  Name = (node: NameNode): string => {
    return node.value;
  };

  ListType = (node: ListTypeNode): string => {
    const asString = (node.type as any) as string;

    return `?Array<${asString}>`;
  };

  NamedType = (node: NamedTypeNode): string => {
    const asString = (node.name as any) as string;
    const type =
      this._parsedConfig.mapping[asString] || this._parsedConfig.scalars[asString] || this._convertName(asString);

    return `?${type}`;
  };

  NonNullType = (node: NonNullTypeNode): string => {
    const asString = (node.type as any) as string;

    if (asString.charAt(0) === '?') {
      return asString.substr(1);
    }

    return asString;
  };

  FieldDefinition = (node: FieldDefinitionNode) => {
    const hasArguments = node.arguments && node.arguments.length > 0;

    return (parent, isSubscriptionType) =>
      indent(
        `${node.name}?: ${isSubscriptionType ? 'SubscriptionResolver' : 'Resolver'}<${node.type}, ParentType, Context${
          hasArguments ? `, ${parent + this._convertName(node.name, false) + 'Args'}` : ''
        }>,`
      );
  };

  ObjectTypeDefinition = (node: ObjectTypeDefinitionNode) => {
    const name = toPascalCase(node.name + 'Resolvers');
    const block = new DeclarationBlock()
      .export()
      .asKind('interface')
      .withName(name, `<Context = ${this._parsedConfig.contextType}, ParentType = ${node.name}>`)
      .withBlock(
        node.fields
          .map((f: any) => f(node.name, ((node.name as any) as string) === this._subscriptionTypeName))
          .join('\n')
      );

    return block.string;
  };
}
