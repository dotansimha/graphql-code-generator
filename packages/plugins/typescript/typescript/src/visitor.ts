import {
  BaseTypesVisitor,
  DeclarationBlock,
  DeclarationKind,
  getConfigValue,
  indent,
  isOneOfInputObjectType,
  normalizeAvoidOptionals,
  NormalizedAvoidOptionalsConfig,
  ParsedTypesConfig,
  transformComment,
  wrapWithSingleQuotes,
} from '@graphql-codegen/visitor-plugin-common';
import autoBind from 'auto-bind';
import {
  EnumTypeDefinitionNode,
  FieldDefinitionNode,
  GraphQLObjectType,
  GraphQLSchema,
  InputValueDefinitionNode,
  isEnumType,
  Kind,
  ListTypeNode,
  NamedTypeNode,
  NonNullTypeNode,
  TypeDefinitionNode,
  UnionTypeDefinitionNode,
} from 'graphql';
import { TypeScriptPluginConfig } from './config.js';
import { TypeScriptOperationVariablesToObject } from './typescript-variables-to-object.js';

export interface TypeScriptPluginParsedConfig extends ParsedTypesConfig {
  avoidOptionals: NormalizedAvoidOptionalsConfig;
  constEnums: boolean;
  enumsAsTypes: boolean;
  futureProofEnums: boolean;
  futureProofUnions: boolean;
  enumsAsConst: boolean;
  numericEnums: boolean;
  onlyEnums: boolean;
  onlyOperationTypes: boolean;
  immutableTypes: boolean;
  maybeValue: string;
  inputMaybeValue: string;
  noExport: boolean;
  useImplementingTypes: boolean;
}

export const EXACT_SIGNATURE = `type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };`;
export const MAKE_OPTIONAL_SIGNATURE = `type MakeOptional<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]?: Maybe<T[SubKey]> };`;
export const MAKE_MAYBE_SIGNATURE = `type MakeMaybe<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]: Maybe<T[SubKey]> };`;
export const MAKE_EMPTY_SIGNATURE = `type MakeEmpty<T extends { [key: string]: unknown }, K extends keyof T> = { [_ in K]?: never };`;
export const MAKE_INCREMENTAL_SIGNATURE = `type Incremental<T> = T | { [P in keyof T]?: P extends ' $fragmentName' | '__typename' ? T[P] : never };`;

export class TsVisitor<
  TRawConfig extends TypeScriptPluginConfig = TypeScriptPluginConfig,
  TParsedConfig extends TypeScriptPluginParsedConfig = TypeScriptPluginParsedConfig
> extends BaseTypesVisitor<TRawConfig, TParsedConfig> {
  constructor(schema: GraphQLSchema, pluginConfig: TRawConfig, additionalConfig: Partial<TParsedConfig> = {}) {
    super(schema, pluginConfig, {
      noExport: getConfigValue(pluginConfig.noExport, false),
      avoidOptionals: normalizeAvoidOptionals(getConfigValue(pluginConfig.avoidOptionals, false)),
      maybeValue: getConfigValue(pluginConfig.maybeValue, 'T | null'),
      inputMaybeValue: getConfigValue(
        pluginConfig.inputMaybeValue,
        getConfigValue(pluginConfig.maybeValue, 'Maybe<T>')
      ),
      constEnums: getConfigValue(pluginConfig.constEnums, false),
      enumsAsTypes: getConfigValue(pluginConfig.enumsAsTypes, false),
      futureProofEnums: getConfigValue(pluginConfig.futureProofEnums, false),
      futureProofUnions: getConfigValue(pluginConfig.futureProofUnions, false),
      enumsAsConst: getConfigValue(pluginConfig.enumsAsConst, false),
      numericEnums: getConfigValue(pluginConfig.numericEnums, false),
      onlyEnums: getConfigValue(pluginConfig.onlyEnums, false),
      onlyOperationTypes: getConfigValue(pluginConfig.onlyOperationTypes, false),
      immutableTypes: getConfigValue(pluginConfig.immutableTypes, false),
      useImplementingTypes: getConfigValue(pluginConfig.useImplementingTypes, false),
      entireFieldWrapperValue: getConfigValue(pluginConfig.entireFieldWrapperValue, 'T'),
      wrapEntireDefinitions: getConfigValue(pluginConfig.wrapEntireFieldDefinitions, false),
      ...additionalConfig,
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
        pluginConfig.enumSuffix,
        this.config.enumValues,
        false,
        this.config.directiveArgumentAndInputFieldMappings,
        'InputMaybe'
      )
    );
    this.setDeclarationBlockConfig({
      enumNameValueSeparator: ' =',
      ignoreExport: this.config.noExport,
    });
  }

  protected _getTypeForNode(node: NamedTypeNode, isVisitingInputType: boolean): string {
    const typeAsString = node.name.value;

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

    const typeString = super._getTypeForNode(node, isVisitingInputType);
    const schemaType = this._schema.getType(node.name.value);

    if (isEnumType(schemaType)) {
      // futureProofEnums + enumsAsTypes combination adds the future value to the enum type itself
      // so it's not necessary to repeat it in the usage
      const futureProofEnumUsageEnabled = this.config.futureProofEnums === true && this.config.enumsAsTypes !== true;

      if (futureProofEnumUsageEnabled && this.config.allowEnumStringTypes === true) {
        return `${typeString} | '%future added value' | ` + '`${' + typeString + '}`';
      }

      if (futureProofEnumUsageEnabled) {
        return `${typeString} | '%future added value'`;
      }

      if (this.config.allowEnumStringTypes === true) {
        return `${typeString} | ` + '`${' + typeString + '}`';
      }
    }

    return typeString;
  }

  public getWrapperDefinitions(): string[] {
    if (this.config.onlyEnums) return [];

    const definitions: string[] = [
      this.getMaybeValue(),
      this.getInputMaybeValue(),
      this.getExactDefinition(),
      this.getMakeOptionalDefinition(),
      this.getMakeMaybeDefinition(),
      this.getMakeEmptyDefinition(),
      this.getIncrementalDefinition(),
    ];

    if (this.config.wrapFieldDefinitions) {
      definitions.push(this.getFieldWrapperValue());
    }
    if (this.config.wrapEntireDefinitions) {
      definitions.push(this.getEntireFieldWrapperValue());
    }

    return definitions;
  }

  public getExactDefinition(): string {
    if (this.config.onlyEnums) return '';

    return `${this.getExportPrefix()}${EXACT_SIGNATURE}`;
  }

  public getMakeOptionalDefinition(): string {
    return `${this.getExportPrefix()}${MAKE_OPTIONAL_SIGNATURE}`;
  }

  public getMakeMaybeDefinition(): string {
    if (this.config.onlyEnums) return '';

    return `${this.getExportPrefix()}${MAKE_MAYBE_SIGNATURE}`;
  }

  public getMakeEmptyDefinition(): string {
    return `${this.getExportPrefix()}${MAKE_EMPTY_SIGNATURE}`;
  }

  public getIncrementalDefinition(): string {
    return `${this.getExportPrefix()}${MAKE_INCREMENTAL_SIGNATURE}`;
  }

  public getMaybeValue(): string {
    return `${this.getExportPrefix()}type Maybe<T> = ${this.config.maybeValue};`;
  }

  public getInputMaybeValue(): string {
    return `${this.getExportPrefix()}type InputMaybe<T> = ${this.config.inputMaybeValue};`;
  }

  protected clearOptional(str: string): string {
    if (str.startsWith('Maybe')) {
      return str.replace(/Maybe<(.*?)>$/, '$1');
    }
    if (str.startsWith('InputMaybe')) {
      return str.replace(/InputMaybe<(.*?)>$/, '$1');
    }

    return str;
  }

  protected getExportPrefix(): string {
    if (this.config.noExport) {
      return '';
    }

    return super.getExportPrefix();
  }

  getMaybeWrapper(ancestors): string {
    const currentVisitContext = this.getVisitorKindContextFromAncestors(ancestors);
    const isInputContext = currentVisitContext.includes(Kind.INPUT_OBJECT_TYPE_DEFINITION);

    return isInputContext ? 'InputMaybe' : 'Maybe';
  }

  NamedType(node: NamedTypeNode, key, parent, path, ancestors): string {
    return `${this.getMaybeWrapper(ancestors)}<${super.NamedType(node, key, parent, path, ancestors)}>`;
  }

  ListType(node: ListTypeNode, key, parent, path, ancestors): string {
    return `${this.getMaybeWrapper(ancestors)}<${super.ListType(node, key, parent, path, ancestors)}>`;
  }

  UnionTypeDefinition(node: UnionTypeDefinitionNode, key: string | number | undefined, parent: any): string {
    if (this.config.onlyOperationTypes || this.config.onlyEnums) return '';

    let withFutureAddedValue: string[] = [];
    if (this.config.futureProofUnions) {
      withFutureAddedValue = [
        this.config.immutableTypes ? `{ readonly __typename?: "%other" }` : `{ __typename?: "%other" }`,
      ];
    }
    const originalNode = parent[key] as UnionTypeDefinitionNode;
    const possibleTypes = originalNode.types
      .map(t => (this.scalars[t.name.value] ? this._getScalar(t.name.value, 'output') : this.convertName(t)))
      .concat(...withFutureAddedValue)
      .join(' | ');

    return new DeclarationBlock(this._declarationBlockConfig)
      .export()
      .asKind('type')
      .withName(this.convertName(node))
      .withComment(node.description?.value)
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
    const typeString = this.config.wrapEntireDefinitions
      ? `EntireFieldWrapper<${node.type}>`
      : (node.type as any as string);
    const originalFieldNode = parent[key] as FieldDefinitionNode;
    const addOptionalSign = !this.config.avoidOptionals.field && originalFieldNode.type.kind !== Kind.NON_NULL_TYPE;
    const comment = this.getNodeComment(node);
    const { type } = this.config.declarationKind;

    return (
      comment +
      indent(
        `${this.config.immutableTypes ? 'readonly ' : ''}${node.name.value}${
          addOptionalSign ? '?' : ''
        }: ${typeString}${this.getPunctuation(type)}`
      )
    );
  }

  InputValueDefinition(
    node: InputValueDefinitionNode,
    key?: number | string,
    parent?: any,
    _path?: Array<string | number>,
    ancestors?: Array<TypeDefinitionNode>
  ): string {
    const originalFieldNode = parent[key] as FieldDefinitionNode;

    const addOptionalSign =
      !this.config.avoidOptionals.inputValue &&
      (originalFieldNode.type.kind !== Kind.NON_NULL_TYPE ||
        (!this.config.avoidOptionals.defaultValue && node.defaultValue !== undefined));
    const comment = this.getNodeComment(node);
    const declarationKind = this.config.declarationKind.type;

    let type: string = node.type as any as string;
    if (node.directives && this.config.directiveArgumentAndInputFieldMappings) {
      type = this._getDirectiveOverrideType(node.directives) || type;
    }

    const readonlyPrefix = this.config.immutableTypes ? 'readonly ' : '';

    const buildFieldDefinition = (isOneOf = false) => {
      return `${readonlyPrefix}${node.name.value}${addOptionalSign && !isOneOf ? '?' : ''}: ${
        isOneOf ? this.clearOptional(type) : type
      }${this.getPunctuation(declarationKind)}`;
    };

    const realParentDef = ancestors?.[ancestors.length - 1];
    if (realParentDef) {
      const parentType = this._schema.getType(realParentDef.name.value);

      if (isOneOfInputObjectType(parentType)) {
        if (originalFieldNode.type.kind === Kind.NON_NULL_TYPE) {
          throw new Error(
            'Fields on an input object type can not be non-nullable. It seems like the schema was not validated.'
          );
        }
        const fieldParts: Array<string> = [];
        for (const fieldName of Object.keys(parentType.getFields())) {
          if (fieldName === node.name.value) {
            fieldParts.push(buildFieldDefinition(true));
            continue;
          }
          fieldParts.push(`${readonlyPrefix}${fieldName}?: never;`);
        }
        return comment + indent(`{ ${fieldParts.join(' ')} }`);
      }
    }

    return comment + indent(buildFieldDefinition());
  }

  EnumTypeDefinition(node: EnumTypeDefinitionNode): string {
    const enumName = node.name.value;

    // In case of mapped external enum string
    if (this.config.enumValues[enumName]?.sourceFile) {
      return `export { ${this.config.enumValues[enumName].typeIdentifier} };\n`;
    }

    const getValueFromConfig = (enumValue: string | number) => {
      if (typeof this.config.enumValues[enumName]?.mappedValues?.[enumValue] !== 'undefined') {
        return this.config.enumValues[enumName].mappedValues[enumValue];
      }
      return null;
    };

    const withFutureAddedValue = [
      this.config.futureProofEnums ? [indent('| ' + wrapWithSingleQuotes('%future added value'))] : [],
    ];

    const enumTypeName = this.convertName(node, {
      useTypesPrefix: this.config.enumPrefix,
      useTypesSuffix: this.config.enumSuffix,
    });

    if (this.config.enumsAsTypes) {
      return new DeclarationBlock(this._declarationBlockConfig)
        .export()
        .asKind('type')
        .withComment(node.description?.value)
        .withName(enumTypeName)
        .withContent(
          '\n' +
            node.values
              .map(enumOption => {
                const name = enumOption.name.value;
                const enumValue: string | number = getValueFromConfig(name) ?? name;
                const comment = transformComment(enumOption.description?.value, 1);

                return comment + indent('| ' + wrapWithSingleQuotes(enumValue));
              })
              .concat(...withFutureAddedValue)
              .join('\n')
        ).string;
    }

    if (this.config.numericEnums) {
      const block = new DeclarationBlock(this._declarationBlockConfig)
        .export()
        .withComment(node.description?.value)
        .withName(enumTypeName)
        .asKind('enum')
        .withBlock(
          node.values
            .map((enumOption, i) => {
              const valueFromConfig = getValueFromConfig(enumOption.name.value);
              const enumValue: string | number = valueFromConfig ?? i;
              const comment = transformComment(enumOption.description?.value, 1);
              const optionName = this.makeValidEnumIdentifier(
                this.convertName(enumOption, {
                  useTypesPrefix: false,
                  transformUnderscore: true,
                })
              );
              return comment + indent(optionName) + ` = ${enumValue}`;
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
        .withComment(node.description?.value)
        .withBlock(
          node.values
            .map(enumOption => {
              const optionName = this.makeValidEnumIdentifier(
                this.convertName(enumOption, {
                  useTypesPrefix: false,
                  transformUnderscore: true,
                })
              );
              const comment = transformComment(enumOption.description?.value, 1);
              const name = enumOption.name.value;
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
      .withComment(node.description?.value)
      .withBlock(this.buildEnumValuesBlock(enumName, node.values)).string;
  }

  protected getPunctuation(_declarationKind: DeclarationKind): string {
    return ';';
  }
}
