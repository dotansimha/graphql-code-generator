import { transformComment, wrapWithSingleQuotes, DeclarationBlock, indent, BaseTypesVisitor, ParsedTypesConfig, getConfigValue, DeclarationKind } from '@graphql-codegen/visitor-plugin-common';
import { TypeScriptPluginConfig } from './config';
import { AvoidOptionalsConfig } from './types';
import autoBind from 'auto-bind';
import { FieldDefinitionNode, NamedTypeNode, ListTypeNode, NonNullTypeNode, EnumTypeDefinitionNode, Kind, InputValueDefinitionNode, GraphQLSchema, GraphQLEnumType } from 'graphql';
import { TypeScriptOperationVariablesToObject } from './typescript-variables-to-object';
import { normalizeAvoidOptionals } from './avoid-optionals';

export interface TypeScriptPluginParsedConfig extends ParsedTypesConfig {
  avoidOptionals: AvoidOptionalsConfig;
  constEnums: boolean;
  enumsAsTypes: boolean;
  fieldWrapperValue: string;
  immutableTypes: boolean;
  maybeValue: string;
  noExport: boolean;
  wrapFieldDefinitions: boolean;
}

export class TsVisitor<TRawConfig extends TypeScriptPluginConfig = TypeScriptPluginConfig, TParsedConfig extends TypeScriptPluginParsedConfig = TypeScriptPluginParsedConfig> extends BaseTypesVisitor<TRawConfig, TParsedConfig> {
  constructor(schema: GraphQLSchema, pluginConfig: TRawConfig, additionalConfig: Partial<TParsedConfig> = {}) {
    super(schema, pluginConfig, {
      noExport: getConfigValue(pluginConfig.noExport, false),
      avoidOptionals: normalizeAvoidOptionals(getConfigValue(pluginConfig.avoidOptionals, false)),
      maybeValue: getConfigValue(pluginConfig.maybeValue, 'T | null'),
      fieldWrapperValue: getConfigValue(pluginConfig.fieldWrapperValue, 'T'),
      constEnums: getConfigValue(pluginConfig.constEnums, false),
      enumsAsTypes: getConfigValue(pluginConfig.enumsAsTypes, false),
      immutableTypes: getConfigValue(pluginConfig.immutableTypes, false),
      wrapFieldDefinitions: getConfigValue(pluginConfig.wrapFieldDefinitions, false),
      ...(additionalConfig || {}),
    } as TParsedConfig);

    autoBind(this);
    const enumNames = Object.values(schema.getTypeMap())
      .map(type => (type instanceof GraphQLEnumType ? type.name : undefined))
      .filter(t => t);
    this.setArgumentsTransformer(new TypeScriptOperationVariablesToObject(this.scalars, this.convertName, this.config.avoidOptionals.object, this.config.immutableTypes, null, enumNames, pluginConfig.enumPrefix, this.config.enumValues));
    this.setDeclarationBlockConfig({
      enumNameValueSeparator: ' =',
      ignoreExport: this.config.noExport,
    });
  }

  public getWrapperDefinitions(): string[] {
    const definitions: string[] = [this.getMaybeValue()];
    if (this.config.wrapFieldDefinitions) {
      definitions.push(this.getFieldWrapperValue());
    }
    return definitions;
  }

  public getMaybeValue(): string {
    return `${this.config.noExport ? '' : 'export '}type Maybe<T> = ${this.config.maybeValue};`;
  }

  public getFieldWrapperValue(): string {
    return `${this.config.noExport ? '' : 'export '}type FieldWrapper<T> = ${this.config.fieldWrapperValue};`;
  }

  protected clearOptional(str: string): string {
    if (str.startsWith('Maybe')) {
      return str.replace(/Maybe<(.*?)>$/, '$1');
    }

    return str;
  }

  NamedType(node: NamedTypeNode): string {
    return `Maybe<${super.NamedType(node)}>`;
  }

  ListType(node: ListTypeNode): string {
    return `Maybe<${super.ListType(node)}>`;
  }

  protected wrapWithListType(str: string): string {
    return `${this.config.immutableTypes ? 'ReadonlyArray' : 'Array'}<${str}>`;
  }

  NonNullType(node: NonNullTypeNode): string {
    const baseValue = super.NonNullType(node);

    return this.clearOptional(baseValue);
  }

  FieldDefinition(node: FieldDefinitionNode, key?: number | string, parent?: any): string {
    const typeString = this.config.wrapFieldDefinitions ? `FieldWrapper<${node.type}>` : ((node.type as any) as string);
    const originalFieldNode = parent[key] as FieldDefinitionNode;
    const addOptionalSign = !this.config.avoidOptionals.object && originalFieldNode.type.kind !== Kind.NON_NULL_TYPE;
    const comment = transformComment((node.description as any) as string, 1);
    const { type } = this.config.declarationKind;

    return comment + indent(`${this.config.immutableTypes ? 'readonly ' : ''}${node.name}${addOptionalSign ? '?' : ''}: ${typeString}${this.getPunctuation(type)}`);
  }

  InputValueDefinition(node: InputValueDefinitionNode, key?: number | string, parent?: any): string {
    const originalFieldNode = parent[key] as FieldDefinitionNode;
    const addOptionalSign = !this.config.avoidOptionals.inputValue && originalFieldNode.type.kind !== Kind.NON_NULL_TYPE;
    const comment = transformComment((node.description as any) as string, 1);
    const { type } = this.config.declarationKind;
    return comment + indent(`${this.config.immutableTypes ? 'readonly ' : ''}${node.name}${addOptionalSign ? '?' : ''}: ${node.type}${this.getPunctuation(type)}`);
  }

  EnumTypeDefinition(node: EnumTypeDefinitionNode): string {
    const enumName = (node.name as any) as string;

    // In case of mapped external enum string
    if (this.config.enumValues[enumName] && this.config.enumValues[enumName].sourceFile) {
      return `export { ${this.config.enumValues[enumName].typeIdentifier} };\n`;
    }

    const enumTypeName = this.convertName(node, { useTypesPrefix: this.config.enumPrefix });

    if (this.config.enumsAsTypes) {
      return new DeclarationBlock(this._declarationBlockConfig)
        .export()
        .asKind('type')
        .withComment((node.description as any) as string)
        .withName(enumTypeName)
        .withContent(
          '\n' +
            node.values
              .map(enumOption => {
                let enumValue: string | number = (enumOption.name as any) as string;
                const comment = transformComment((enumOption.description as any) as string, 1);

                if (this.config.enumValues[enumName] && this.config.enumValues[enumName].mappedValues && typeof this.config.enumValues[enumName].mappedValues[enumValue] !== 'undefined') {
                  enumValue = this.config.enumValues[enumName].mappedValues[enumValue];
                }

                return comment + indent(wrapWithSingleQuotes(enumValue));
              })
              .join(' |\n')
        ).string;
    } else {
      return new DeclarationBlock(this._declarationBlockConfig)
        .export()
        .asKind(this.config.constEnums ? 'const enum' : 'enum')
        .withName(enumTypeName)
        .withComment((node.description as any) as string)
        .withBlock(this.buildEnumValuesBlock(enumName, node.values)).string;
    }
  }

  protected getPunctuation(declarationKind: DeclarationKind): string {
    return ';';
  }
}
