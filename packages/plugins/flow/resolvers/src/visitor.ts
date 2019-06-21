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

  protected buildMapperImport(source: string, types: { identifier: string; asDefault?: boolean }[]): string {
    if (types[0] && types[0].asDefault) {
      return `import type ${types[0].identifier} from '${source}';`;
    }

    return `import { ${types.map(t => `type ${t.identifier}`).join(', ')} } from '${source}';`;
  }

  protected formatRootResolver(schemaTypeName: string, resolverType: string): string {
    return `${schemaTypeName}?: ${resolverType}${resolverType.includes('<') ? '' : '<>'},`;
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

  protected applyMaybe(str: string): string {
    return `?${str}`;
  }

  protected clearMaybe(str: string): string {
    if (str.startsWith('?')) {
      return str.substr(1);
    }

    return str;
  }

  protected getTypeToUse(name: string): string {
    const resolversType = this.convertName('ResolversTypes');

    return `$ElementType<${resolversType}, '${name}'>`;
  }

  protected getParentTypeToUse(name: string): string {
    const resolversType = this.convertName('ResolversParentTypes');

    return `$ElementType<${resolversType}, '${name}'>`;
  }

  protected replaceFieldsInType(typeName: string, relevantFields: { fieldName: string; replaceWithType: string }[]): string {
    return `$Diff<${typeName}, { ${relevantFields.map(f => `${f.fieldName}: * `).join(', ')} }> & { ${relevantFields.map(f => `${f.fieldName}: ${f.replaceWithType}`).join(', ')} }`;
  }

  ScalarTypeDefinition(node: ScalarTypeDefinitionNode): string {
    const nameAsString = (node.name as any) as string;
    const baseName = this.getTypeToUse(nameAsString);
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
