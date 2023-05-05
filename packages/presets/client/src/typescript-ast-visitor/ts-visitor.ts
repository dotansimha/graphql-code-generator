import {
  AvoidOptionalsConfig,
  BaseTypesVisitor,
  DeclarationKind,
  getConfigValue,
  indent,
  ParsedTypesConfig,
} from '@graphql-codegen/visitor-plugin-common';
import autoBind from 'auto-bind';
import {
  FieldDefinitionNode,
  GraphQLObjectType,
  GraphQLSchema,
  isEnumType,
  Kind,
  ListTypeNode,
  NamedTypeNode,
  NonNullTypeNode,
} from 'graphql';
import { TypeScriptPluginConfig } from './config.js';
import { TypeScriptOperationVariablesToObject } from './typescript-variables-to-object.js';
import {
  factory,
  TypeNode,
  Printer,
  SourceFile,
  SyntaxKind,
  EnumMember,
  Expression,
  addSyntheticLeadingComment,
  Node,
  EmitHint,
} from 'typescript';

export interface TypeScriptPluginParsedConfig extends ParsedTypesConfig {
  avoidOptionals: AvoidOptionalsConfig;
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

export class TsVisitor<
  TRawConfig extends TypeScriptPluginConfig = TypeScriptPluginConfig,
  TParsedConfig extends TypeScriptPluginParsedConfig = TypeScriptPluginParsedConfig
> extends BaseTypesVisitor<TRawConfig, TParsedConfig> {
  sourceFile: SourceFile | null = null;
  printer: Printer | null = null;
  constructor(
    schema: GraphQLSchema,
    pluginConfig: TRawConfig,
    additionalConfig: Partial<TParsedConfig> = {},
    sourceFile: SourceFile,
    printer: Printer
  ) {
    super(schema, pluginConfig, {
      noExport: getConfigValue(pluginConfig.noExport, false),
      avoidOptionals: normalizeAvoidOptionals(getConfigValue(pluginConfig.avoidOptionals, false)),
      maybeValue: getConfigValue(pluginConfig.maybeValue, 'T | null'),
      inputMaybeValue: getConfigValue(
        pluginConfig.inputMaybeValue,
        getConfigValue(pluginConfig.maybeValue, 'Maybe<T>')
      ),
      constEnums: false, // I hope so
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

    this.sourceFile = sourceFile;
    this.printer = printer;

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

  protected _printNode(node: Node): string {
    return this.printer?.printNode(EmitHint.Unspecified, node, this.sourceFile!) || '';
  }

  protected _getTypeForNode(node: NamedTypeNode): string {
    const typeAsString = node.name as any as string;

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

    const typeString = super._getTypeForNode(node);
    const schemaType = this._schema.getType(node.name as any as string);

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

  public getMaybeValue(): string {
    return `${this.getExportPrefix()}type Maybe<T> = ${this.config.maybeValue};`;
  }

  public getInputMaybeValue(): string {
    return `${this.getExportPrefix()}type InputMaybe<T> = ${this.config.inputMaybeValue};`;
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

  protected wrapWithListType(str: string): string {
    return `${this.config.immutableTypes ? 'ReadonlyArray' : 'Array'}<${str}>`;
  }

  NonNullType(node: NonNullTypeNode): string {
    const baseValue = super.NonNullType(node);

    if (baseValue.startsWith('Maybe')) {
      return baseValue.replace(/Maybe<(.*?)>$/, '$1');
    }
    if (baseValue.startsWith('InputMaybe')) {
      return baseValue.replace(/InputMaybe<(.*?)>$/, '$1');
    }

    return baseValue;
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
        `${this.config.immutableTypes ? 'readonly ' : ''}${node.name}${
          addOptionalSign ? '?' : ''
        }: ${typeString}${this.getPunctuation(type)}`
      )
    );
  }

  protected getPunctuation(_declarationKind: DeclarationKind): string {
    return ';';
  }
}

export const DEFAULT_AVOID_OPTIONALS: AvoidOptionalsConfig = {
  object: false,
  inputValue: false,
  field: false,
  defaultValue: false,
  resolvers: false,
};

export function normalizeAvoidOptionals(avoidOptionals?: boolean | AvoidOptionalsConfig): AvoidOptionalsConfig {
  if (typeof avoidOptionals === 'boolean') {
    return {
      object: avoidOptionals,
      inputValue: avoidOptionals,
      field: avoidOptionals,
      defaultValue: avoidOptionals,
      resolvers: avoidOptionals,
    };
  }

  return {
    ...DEFAULT_AVOID_OPTIONALS,
    ...avoidOptionals,
  };
}

export const enumNode = ({
  name,
  members,
  comment,
  useExport,
}: {
  name: string;
  members: readonly EnumMember[];
  comment?: string;
  useExport: true;
}) => {
  const enumDeclaration = factory.createEnumDeclaration(
    useExport ? [factory.createModifier(SyntaxKind.ExportKeyword)] : [],
    name,
    members
  );

  if (comment) {
    addSyntheticLeadingComment(enumDeclaration, SyntaxKind.MultiLineCommentTrivia, comment, true);
  }

  return enumDeclaration;
};

export const typeNode = ({
  name,
  type,
  comment,
  useExport,
}: {
  name: string;
  type: TypeNode;
  comment?: string;
  useExport: true;
}) => {
  const typeAliasDeclaration = factory.createTypeAliasDeclaration(
    useExport ? [factory.createModifier(SyntaxKind.ExportKeyword)] : [],
    name,
    undefined,
    type
  );

  if (comment) {
    addSyntheticLeadingComment(typeAliasDeclaration, SyntaxKind.MultiLineCommentTrivia, comment, true);
  }

  return typeAliasDeclaration;
};

export const variableDeclarationNode = ({
  name,
  expression,
  comment,
  useExport,
}: {
  name: string;
  expression: Expression;
  comment?: string;
  useExport: true;
}) => {
  const constDelacartion = factory.createVariableStatement(
    useExport ? [factory.createModifier(SyntaxKind.ExportKeyword)] : [],
    factory.createVariableDeclarationList([factory.createVariableDeclaration(name, undefined, undefined, expression)])
  );

  if (comment) {
    addSyntheticLeadingComment(constDelacartion, SyntaxKind.MultiLineCommentTrivia, comment, true);
  }

  return constDelacartion;
};
