import {
  transformComment,
  wrapWithSingleQuotes,
  DeclarationBlock,
  indent,
  BaseTypesVisitor,
  ParsedTypesConfig,
  getConfigValue,
  DeclarationKind,
  normalizeAvoidOptionals,
  AvoidOptionalsConfig,
} from '@graphql-codegen/visitor-plugin-common';
import { TypeScriptPluginConfig } from './config';
import autoBind from 'auto-bind';
import {
  FieldDefinitionNode,
  NamedTypeNode,
  ListTypeNode,
  NonNullTypeNode,
  EnumTypeDefinitionNode,
  Kind,
  InputValueDefinitionNode,
  GraphQLSchema,
  isEnumType,
} from 'graphql';
import { TypeScriptOperationVariablesToObject } from './typescript-variables-to-object';

export interface TypeScriptPluginParsedConfig extends ParsedTypesConfig {
  avoidOptionals: AvoidOptionalsConfig;
  constEnums: boolean;
  enumsAsTypes: boolean;
  futureProofEnums: boolean;
  enumsAsConst: boolean;
  numericEnums: boolean;
  onlyOperationTypes: boolean;
  immutableTypes: boolean;
  maybeValue: string;
  noExport: boolean;
}

export class TsVisitor<
  TRawConfig extends TypeScriptPluginConfig = TypeScriptPluginConfig,
  TParsedConfig extends TypeScriptPluginParsedConfig = TypeScriptPluginParsedConfig
> extends BaseTypesVisitor<TRawConfig, TParsedConfig> {
  constructor(schema: GraphQLSchema, pluginConfig: TRawConfig, additionalConfig: Partial<TParsedConfig> = {}) {
    super(schema, pluginConfig, {
      noExport: getConfigValue(pluginConfig.noExport, false),
      avoidOptionals: normalizeAvoidOptionals(getConfigValue(pluginConfig.avoidOptionals, false)),
      maybeValue: getConfigValue(pluginConfig.maybeValue, 'T | null'),
      constEnums: getConfigValue(pluginConfig.constEnums, false),
      enumsAsTypes: getConfigValue(pluginConfig.enumsAsTypes, false),
      futureProofEnums: getConfigValue(pluginConfig.futureProofEnums, false),
      enumsAsConst: getConfigValue(pluginConfig.enumsAsConst, false),
      numericEnums: getConfigValue(pluginConfig.numericEnums, false),
      onlyOperationTypes: getConfigValue(pluginConfig.onlyOperationTypes, false),
      immutableTypes: getConfigValue(pluginConfig.immutableTypes, false),
      ...(additionalConfig || {}),
    } as TParsedConfig);

    autoBind(this);
    const enumNames = Object.values(schema.getTypeMap())
      .filter(isEnumType)
      .map(type => type.name);
    this.setArgumentsTransformer(
      new TypeScriptOperationVariablesToObject(
        this.scalars,
        this.convertName,
        this.config.avoidOptionals.object,
        this.config.immutableTypes,
        null,
        enumNames,
        pluginConfig.enumPrefix,
        this.config.enumValues
      )
    );
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
    return `${this.getExportPrefix()}type Maybe<T> = ${this.config.maybeValue};`;
  }

  protected clearOptional(str: string): string {
    if (str.startsWith('Maybe')) {
      return str.replace(/Maybe<(.*?)>$/, '$1');
    }

    return str;
  }

  protected getExportPrefix(): string {
    if (this.config.noExport) {
      return '';
    }

    return super.getExportPrefix();
  }

  NamedType(node: NamedTypeNode, key, parent, path, ancestors): string {
    return `Maybe<${super.NamedType(node, key, parent, path, ancestors)}>`;
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
    const typeString = (node.type as any) as string;
    const originalFieldNode = parent[key] as FieldDefinitionNode;
    const addOptionalSign = !this.config.avoidOptionals.field && originalFieldNode.type.kind !== Kind.NON_NULL_TYPE;
    const comment = this.getFieldComment(node);
    const { type } = this.config.declarationKind;

    return (
      comment +
      indent(
        `${this.config.immutableTypes ? 'readonly ' : ''}${node.name}${
          addOptionalSign ? '?' : ''
        }: ${typeString}${this.getPunctuation(type)}`
      )
    );
  }

  InputValueDefinition(node: InputValueDefinitionNode, key?: number | string, parent?: any): string {
    const originalFieldNode = parent[key] as FieldDefinitionNode;
    const addOptionalSign =
      !this.config.avoidOptionals.inputValue && originalFieldNode.type.kind !== Kind.NON_NULL_TYPE;
    const comment = transformComment((node.description as any) as string, 1);
    const { type } = this.config.declarationKind;
    return (
      comment +
      indent(
        `${this.config.immutableTypes ? 'readonly ' : ''}${node.name}${addOptionalSign ? '?' : ''}: ${
          node.type
        }${this.getPunctuation(type)}`
      )
    );
  }

  EnumTypeDefinition(node: EnumTypeDefinitionNode): string {
    const enumName = (node.name as any) as string;

    // In case of mapped external enum string
    if (this.config.enumValues[enumName] && this.config.enumValues[enumName].sourceFile) {
      return `export { ${this.config.enumValues[enumName].typeIdentifier} };\n`;
    }

    const getValueFromConfig = (enumValue: string | number) => {
      if (
        this.config.enumValues[enumName] &&
        this.config.enumValues[enumName].mappedValues &&
        typeof this.config.enumValues[enumName].mappedValues[enumValue] !== 'undefined'
      ) {
        return this.config.enumValues[enumName].mappedValues[enumValue];
      }
      return null;
    };

    const withFutureAddedValue = [
      this.config.futureProofEnums ? [indent('| ' + wrapWithSingleQuotes('%future added value'))] : [],
    ];

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
                const name = (enumOption.name as unknown) as string;
                const enumValue: string | number = getValueFromConfig(name) || name;
                const comment = transformComment((enumOption.description as any) as string, 1);

                return comment + indent('| ' + wrapWithSingleQuotes(enumValue));
              })
              .concat(...withFutureAddedValue)
              .join('\n')
        ).string;
    }

    if (this.config.numericEnums) {
      const block = new DeclarationBlock(this._declarationBlockConfig)
        .export()
        .withComment((node.description as any) as string)
        .withName(enumTypeName)
        .asKind('enum')
        .withBlock(
          node.values
            .map((enumOption, i) => {
              const valueFromConfig = getValueFromConfig((enumOption.name as unknown) as string);
              const enumValue: string | number = valueFromConfig || i;
              const comment = transformComment((enumOption.description as any) as string, 1);

              return comment + indent((enumOption.name as unknown) as string) + ` = ${enumValue}`;
            })
            .concat(...withFutureAddedValue)
            .join(',\n')
        ).string;

      return block;
    }

    if (this.config.enumsAsConst) {
      const typeName = `export type ${enumTypeName} = typeof ${enumTypeName}[keyof typeof ${enumTypeName}];`;
      const enumAsConst = new DeclarationBlock({
        ...this._declarationBlockConfig,
        blockTransformer: block => {
          return block + ' as const';
        },
      })
        .export()
        .asKind('const')
        .withName(enumTypeName)
        .withComment((node.description as any) as string)
        .withBlock(
          node.values
            .map(enumOption => {
              const optionName = this.convertName(enumOption, { useTypesPrefix: false, transformUnderscore: true });
              const comment = transformComment((enumOption.description as any) as string, 1);
              const name = (enumOption.name as unknown) as string;
              const enumValue: string | number = getValueFromConfig(name) || name;

              return comment + indent(`${optionName}: ${wrapWithSingleQuotes(enumValue)}`);
            })
            .join(',\n')
        ).string;

      return [enumAsConst, typeName].join('\n');
    }

    return new DeclarationBlock(this._declarationBlockConfig)
      .export()
      .asKind(this.config.constEnums ? 'const enum' : 'enum')
      .withName(enumTypeName)
      .withComment((node.description as any) as string)
      .withBlock(this.buildEnumValuesBlock(enumName, node.values)).string;
  }

  protected getPunctuation(declarationKind: DeclarationKind): string {
    return ';';
  }
}
