import { FlowResolversPluginConfig } from './index';
import { ListTypeNode, NamedTypeNode, NonNullTypeNode, GraphQLSchema } from 'graphql';
import * as autoBind from 'auto-bind';
import { ParsedResolversConfig, BaseResolversVisitor } from 'graphql-codegen-visitor-plugin-common';
import { FlowOperationVariablesToObject } from 'graphql-codegen-flow';

export interface ParsedFlorResolversConfig extends ParsedResolversConfig {}

export class FlowResolversVisitor extends BaseResolversVisitor<FlowResolversPluginConfig, ParsedFlorResolversConfig> {
  constructor(pluginConfig: FlowResolversPluginConfig, schema: GraphQLSchema) {
    super(pluginConfig, null, schema);
    autoBind(this);
    this.setVariablesTransformer(new FlowOperationVariablesToObject(this.config.scalars, this.convertName));
  }

  protected formatRootResolver(schemaTypeName: string, resolverType: string): string {
    return `${schemaTypeName}?: ${resolverType}<>,`;
  }

  protected _getScalar(name: string): string {
    return `$ElementType<Scalars, '${name}'>`;
  }

  protected buildMapperImport(source: string, types: string[]): string {
    return `import { ${types.map(t => `type ${t}`).join(', ')} } from '${source}';`;
  }

  ListType(node: ListTypeNode): string {
    return `?${super.ListType(node)}`;
  }

  NamedType(node: NamedTypeNode): string {
    return `?${super.NamedType(node)}`;
  }

  NonNullType(node: NonNullTypeNode): string {
    const baseValue = super.NonNullType(node);

    if (baseValue.charAt(0) === '?') {
      return baseValue.substr(1);
    }

    return baseValue;
  }
}
