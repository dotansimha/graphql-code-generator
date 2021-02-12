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
  UnionTypeDefinitionNode,
  GraphQLObjectType,
} from 'graphql';
import { TypeScriptOperationVariablesToObject } from './typescript-variables-to-object';

export interface TypeScriptPluginParsedConfig extends ParsedTypesConfig {
  avoidOptionals: AvoidOptionalsConfig;
  constEnums: boolean;
  enumsAsTypes: boolean;
  futureProofEnums: boolean;
  futureProofUnions: boolean;
  enumsAsConst: boolean;
  numericEnums: boolean;
  onlyOperationTypes: boolean;
  immutableTypes: boolean;
  maybeValue: string;
  noExport: boolean;
  useImplementingTypes: boolean;
}

export const EXACT_SIGNATURE = `type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };`;
export const MAKE_OPTIONAL_SIGNATURE = `type MakeOptional<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]?: Maybe<T[SubKey]> };`;
export const MAKE_MAYBE_SIGNATURE = `type MakeMaybe<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]: Maybe<T[SubKey]> };`;

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
      futureProofUnions: getConfigValue(pluginConfig.futureProofUnions, false),
      enumsAsConst: getConfigValue(pluginConfig.enumsAsConst, false),
      numericEnums: getConfigValue(pluginConfig.numericEnums, false),
      onlyOperationTypes: getConfigValue(pluginConfig.onlyOperationTypes, false),
      immutableTypes: getConfigValue(pluginConfig.immutableTypes, false),
      useImplementingTypes: getConfigValue(pluginConfig.useImplementingTypes, false),
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
        this.config.avoidOptionals,
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

  protected _getTypeForNode(node: NamedTypeNode): string {
    const typeAsString = (node.name as any) as string;

    if (this.config.useImplementingTypes) {
      const allTypesMap = this._schema.getTypeMap();
      const implementingTypes: string[] = [];

      // TODO: Move this to a better place, since we are using this logic in some other places as well.
      for (const graphqlType of Object.values(allTypesMap)) {
        if (graphqlType instanceof GraphQLObjectType) {
          const allInterfaces = graphqlType.getInterfaces();

          if (allInterfaces.some(int => typeAsString === int.name)) {
            implementingTypes.push(this.convertName(graphqlType.name));
          }
        }
      }

      if (implementingTypes.length > 0) {
        return implementingTypes.join(' | ');
      }
    }

    return super._getTypeForNode(node);
  }

  public getWrapperDefinitions(): string[] {
    const definitions: string[] = [
      this.getMaybeValue(),
      this.getExactDefinition(),
      this.getMakeOptionalDefinition(),
      this.getMakeMaybeDefinition(),
    ];

    if (this.config.wrapFieldDefinitions) {
      definitions.push(this.getFieldWrapperValue());
    }

    return definitions;
  }

  public getExactDefinition(): string {
    return `${this.getExportPrefix()}${EXACT_SIGNATURE}`;
  }

  public getMakeOptionalDefinition(): string {
    return `${this.getExportPrefix()}${MAKE_OPTIONAL_SIGNATURE}`;
  }

  public getMakeMaybeDefinition(): string {
    return `${this.getExportPrefix()}${MAKE_MAYBE_SIGNATURE}`;
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

  UnionTypeDefinition(node: UnionTypeDefinitionNode, key: string | number | undefined, parent: any): string {
    if (this.config.onlyOperationTypes) return '';
    let withFutureAddedValue: string[] = [];
    if (this.config.futureProofUnions) {
      withFutureAddedValue = [
        this.config.immutableTypes ? `{ readonly __typename?: "%other" }` : `{ __typename?: "%other" }`,
      ];
    }
    const originalNode = parent[key] as UnionTypeDefinitionNode;
    const possibleTypes = originalNode.types
      .map(t => (this.scalars[t.name.value] ? this._getScalar(t.name.value) : this.convertName(t)))
      .concat(...withFutureAddedValue)
      .join(' | ');

    return new DeclarationBlock(this._declarationBlockConfig)
      .export()
      .asKind('type')
      .withName(this.convertName(node))
      .withComment((node.description as any) as string)
      .withContent(possibleTypes).string;
    // return super.UnionTypeDefinition(node, key, parent).concat(withFutureAddedValue).join("");
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
      !this.config.avoidOptionals.inputValue &&
      (originalFieldNode.type.kind !== Kind.NON_NULL_TYPE ||
        (!this.config.avoidOptionals.defaultValue && node.defaultValue !== undefined));
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
                const enumValue: string | number = getValueFromConfig(name) ?? name;
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
              const enumValue: string | number = valueFromConfig ?? i;
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
              const enumValue: string | number = getValueFromConfig(name) ?? name;

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

  protected getPunctuation(_declarationKind: DeclarationKind): string {
    return ';';
  }
}
