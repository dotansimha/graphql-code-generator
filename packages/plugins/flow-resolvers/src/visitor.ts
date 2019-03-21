import { FlowResolversPluginConfig } from './index';
import { ListTypeNode, NamedTypeNode, NonNullTypeNode, GraphQLSchema, ScalarTypeDefinitionNode } from 'graphql';
import * as autoBind from 'auto-bind';
import { indent, ParsedResolversConfig, BaseResolversVisitor, DeclarationBlock } from '@graphql-codegen/visitor-plugin-common';
import { FlowOperationVariablesToObject } from '@graphql-codegen/flow';

export interface ParsedFlorResolversConfig extends ParsedResolversConfig {}

export class FlowResolversVisitor extends BaseResolversVisitor<FlowResolversPluginConfig, ParsedFlorResolversConfig> {
  constructor(pluginConfig: FlowResolversPluginConfig, schema: GraphQLSchema) {
    super(pluginConfig, null, schema);
    autoBind(this);
    this.setVariablesTransformer(new FlowOperationVariablesToObject(this.config.scalars, this.convertName));
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

  ScalarTypeDefinition(node: ScalarTypeDefinitionNode): string {
    const nameAsString = (node.name as any) as string;
    const baseName = this.scalars[nameAsString] ? this._getScalar(nameAsString) : this.convertName(node);
    this._collectedResolvers[node.name as any] = 'GraphQLScalarType';

    return new DeclarationBlock({
      ...this._declarationBlockConfig,
      blockTransformer(block) {
        return block;
      },
    })
      .export()
      .asKind('type')
      .withName(
        this.convertName(node, {
          suffix: 'ScalarConfig',
        })
      )
      .withBlock([indent(`...GraphQLScalarTypeConfig<${baseName}, any>`), indent(`name: '${node.name}'`)].join(', \n')).string;
  }
}
