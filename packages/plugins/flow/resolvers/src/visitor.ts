import {
  ListTypeNode,
  NamedTypeNode,
  NonNullTypeNode,
  GraphQLSchema,
  ScalarTypeDefinitionNode,
  InputValueDefinitionNode,
  EnumTypeDefinitionNode,
} from 'graphql';
import autoBind from 'auto-bind';
import {
  RawResolversConfig,
  indent,
  ParsedResolversConfig,
  BaseResolversVisitor,
  DeclarationBlock,
  DeclarationKind,
} from '@graphql-codegen/visitor-plugin-common';
import { FlowOperationVariablesToObject } from '@graphql-codegen/flow';
import { FLOW_REQUIRE_FIELDS_TYPE } from './flow-util-types';

export const ENUM_RESOLVERS_SIGNATURE =
  'export type EnumResolverSignature<T, AllowedValues = any> = $ObjMap<T, () => AllowedValues>;';

export interface ParsedFlorResolversConfig extends ParsedResolversConfig {}

export class FlowResolversVisitor extends BaseResolversVisitor<RawResolversConfig, ParsedFlorResolversConfig> {
  constructor(pluginConfig: RawResolversConfig, schema: GraphQLSchema) {
    super(pluginConfig, null, schema);
    autoBind(this);
    this.setVariablesTransformer(new FlowOperationVariablesToObject(this.scalars, this.convertName));
  }

  protected _getScalar(name: string): string {
    return `$ElementType<Scalars, '${name}'>`;
  }

  protected applyRequireFields(argsType: string, fields: InputValueDefinitionNode[]): string {
    this._globalDeclarations.add(FLOW_REQUIRE_FIELDS_TYPE);
    return `$RequireFields<${argsType}, { ${fields.map(f => `${f.name.value}: *`).join(', ')} }>`;
  }

  protected applyOptionalFields(argsType: string, fields: readonly InputValueDefinitionNode[]): string {
    return argsType;
  }

  protected buildMapperImport(source: string, types: { identifier: string; asDefault?: boolean }[]): string {
    if (types[0] && types[0].asDefault) {
      return `import type ${types[0].identifier} from '${source}';`;
    }

    return `import { ${types.map(t => `type ${t.identifier}`).join(', ')} } from '${source}';`;
  }

  protected formatRootResolver(schemaTypeName: string, resolverType: string, declarationKind: DeclarationKind): string {
    return `${schemaTypeName}?: ${resolverType}${resolverType.includes('<') ? '' : '<>'}${this.getPunctuation(
      declarationKind
    )}`;
  }

  protected transformParentGenericType(parentType: string): string {
    return `ParentType = ${parentType}`;
  }

  ListType(node: ListTypeNode): string {
    return `?${super.ListType(node)}`;
  }

  NamedType(node: NamedTypeNode): string {
    return `?${super.NamedType(node)}`;
  }

  NonNullType(node: NonNullTypeNode): string {
    const baseValue = super.NonNullType(node);

    if (baseValue.startsWith('?')) {
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

  protected replaceFieldsInType(
    typeName: string,
    relevantFields: { fieldName: string; replaceWithType: string }[]
  ): string {
    return `$Diff<${typeName}, { ${relevantFields
      .map(f => `${f.fieldName}: * `)
      .join(', ')} }> & { ${relevantFields.map(f => `${f.fieldName}: ${f.replaceWithType}`).join(', ')} }`;
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
      .withBlock([indent(`...GraphQLScalarTypeConfig<${baseName}, any>`), indent(`name: '${node.name}'`)].join(', \n'))
      .string;
  }

  protected getPunctuation(declarationKind: DeclarationKind): string {
    return declarationKind === 'type' ? ',' : ';';
  }

  protected buildEnumResolverContentBlock(node: EnumTypeDefinitionNode, mappedEnumType: string): string {
    const valuesMap = `{| ${(node.values || [])
      .map(v => `${(v.name as any) as string}${this.config.avoidOptionals ? '' : '?'}: *`)
      .join(', ')} |}`;

    this._globalDeclarations.add(ENUM_RESOLVERS_SIGNATURE);

    return `EnumResolverSignature<${valuesMap}, ${mappedEnumType}>`;
  }

  protected buildEnumResolversExplicitMappedValues(
    node: EnumTypeDefinitionNode,
    valuesMapping: { [valueName: string]: string | number }
  ): string {
    return `{| ${(node.values || [])
      .map(v => {
        const valueName = (v.name as any) as string;
        const mappedValue = valuesMapping[valueName];

        return `${valueName}: ${typeof mappedValue === 'number' ? mappedValue : `'${mappedValue}'`}`;
      })
      .join(', ')} |}`;
  }
}
