import {
  AvoidOptionalsConfig,
  BaseDocumentsVisitor,
  DeclarationKind,
  generateFragmentImportStatement,
  getConfigValue,
  LoadedFragment,
  normalizeAvoidOptionals,
  ParsedDocumentsConfig,
  ParsedMapper,
  parseMapper,
  PreResolveTypesProcessor,
  SelectionSetProcessorConfig,
  SelectionSetToObject,
  wrapTypeWithModifiers,
} from '@graphql-codegen/visitor-plugin-common';
import autoBind from 'auto-bind';
import {
  DirectiveNode,
  GraphQLList,
  GraphQLNamedType,
  GraphQLNonNull,
  GraphQLOutputType,
  GraphQLSchema,
  isEnumType,
  isNonNullType,
  isListType,
  isNullableType,
} from 'graphql';
import { TypeScriptDocumentsPluginConfig } from './config.js';
import { TypeScriptOperationVariablesToObject } from './ts-operation-variables-to-object.js';
import { TypeScriptSelectionSetProcessor } from './ts-selection-set-processor.js';

export interface TypeScriptDocumentsParsedConfig extends ParsedDocumentsConfig {
  arrayInputCoercion: boolean;
  avoidOptionals: AvoidOptionalsConfig;
  immutableTypes: boolean;
  noExport: boolean;
  maybeValue: string;
  directiveFieldMappings: DirectiveFieldMappings;
}

type DirectiveFieldMappings = TypeScriptDocumentsPluginConfig['directiveFieldMappings'];
type NormalizedDirectiveFieldSetting = (ParsedMapper | {}) & Omit<DirectiveFieldMappings[number], 'type'>;
function isFieldTypeMapping(mapping: NormalizedDirectiveFieldSetting): mapping is ParsedMapper {
  return 'type' in mapping;
}

export class TypeScriptDocumentsVisitor extends BaseDocumentsVisitor<
  TypeScriptDocumentsPluginConfig,
  TypeScriptDocumentsParsedConfig
> {
  constructor(schema: GraphQLSchema, config: TypeScriptDocumentsPluginConfig, allFragments: LoadedFragment[]) {
    super(
      config,
      {
        arrayInputCoercion: getConfigValue(config.arrayInputCoercion, true),
        noExport: getConfigValue(config.noExport, false),
        avoidOptionals: normalizeAvoidOptionals(getConfigValue(config.avoidOptionals, false)),
        immutableTypes: getConfigValue(config.immutableTypes, false),
        nonOptionalTypename: getConfigValue(config.nonOptionalTypename, false),
        preResolveTypes: getConfigValue(config.preResolveTypes, true),
        mergeFragmentTypes: getConfigValue(config.mergeFragmentTypes, false),
        // unlike directiveArgumentAndInputFieldMappings, we don't parse mappers yet since we need to evaluate each field directive's args
        directiveFieldMappings: getConfigValue(config.directiveFieldMappings, {}),
      } as TypeScriptDocumentsParsedConfig,
      schema
    );

    autoBind(this);

    const preResolveTypes = getConfigValue(config.preResolveTypes, true);
    const defaultMaybeValue = 'T | null';
    const maybeValue = getConfigValue(config.maybeValue, defaultMaybeValue);

    const wrapOptional = (type: string) => {
      if (preResolveTypes === true) {
        return maybeValue.replace('T', type);
      }
      const prefix = this.config.namespacedImportName ? `${this.config.namespacedImportName}.` : '';
      return `${prefix}Maybe<${type}>`;
    };
    const wrapArray = (type: string) => {
      const listModifier = this.config.immutableTypes ? 'ReadonlyArray' : 'Array';
      return `${listModifier}<${type}>`;
    };

    const formatNamedField = (
      name: string,
      type: GraphQLOutputType | GraphQLNamedType | null,
      isConditional = false,
      directives: ReadonlyArray<DirectiveNode> = []
    ): string => {
      const optional =
        isConditional ||
        (!this.config.avoidOptionals.field &&
          !!type &&
          !isNonNullType(type) &&
          this._evaluateFieldDirectives(directives).nullable) !== false;
      return (this.config.immutableTypes ? `readonly ${name}` : name) + (optional ? '?' : '');
    };

    const processorConfig: SelectionSetProcessorConfig = {
      namespacedImportName: this.config.namespacedImportName,
      convertName: this.convertName.bind(this),
      enumPrefix: this.config.enumPrefix,
      scalars: this.scalars,
      formatNamedField,
      wrapTypeWithModifiers: (baseType, type, directives = []) => {
        const fieldOverrides = this._evaluateFieldDirectives(directives);
        if (isFieldTypeMapping(fieldOverrides)) baseType = fieldOverrides.type;
        if (fieldOverrides.nullableEntries === false && isListType(type))
          type = new GraphQLList(new GraphQLNonNull(type.ofType));
        if (fieldOverrides.nullable === false && isNullableType(type))
          type = new GraphQLNonNull(type) as GraphQLOutputType | GraphQLNamedType;
        return wrapTypeWithModifiers(baseType, type, { wrapOptional, wrapArray });
      },
      avoidOptionals: this.config.avoidOptionals,
    };
    const processor = new (preResolveTypes ? PreResolveTypesProcessor : TypeScriptSelectionSetProcessor)(
      processorConfig
    );
    this.setSelectionSetHandler(
      new SelectionSetToObject(
        processor,
        this.scalars,
        this.schema,
        this.convertName.bind(this),
        this.getFragmentSuffix.bind(this),
        allFragments,
        this.config
      )
    );
    const enumsNames = Object.keys(schema.getTypeMap()).filter(typeName => isEnumType(schema.getType(typeName)));
    this.setVariablesTransformer(
      new TypeScriptOperationVariablesToObject(
        this.scalars,
        this.convertName.bind(this),
        this.config.avoidOptionals.object,
        this.config.immutableTypes,
        this.config.namespacedImportName,
        enumsNames,
        this.config.enumPrefix,
        this.config.enumValues,
        this.config.arrayInputCoercion,
        undefined,
        'InputMaybe'
      )
    );
    this._declarationBlockConfig = {
      ignoreExport: this.config.noExport,
    };
  }

  public getImports(): Array<string> {
    return !this.config.globalNamespace &&
      (this.config.inlineFragmentTypes === 'combine' || this.config.inlineFragmentTypes === 'mask')
      ? this.config.fragmentImports.map(fragmentImport => generateFragmentImportStatement(fragmentImport, 'type'))
      : [];
  }

  protected getPunctuation(_declarationKind: DeclarationKind): string {
    return ';';
  }

  protected applyVariablesWrapper(variablesBlock: string): string {
    const prefix = this.config.namespacedImportName ? `${this.config.namespacedImportName}.` : '';

    return `${prefix}Exact<${variablesBlock === '{}' ? `{ [key: string]: never; }` : variablesBlock}>`;
  }

  /** Evaluate a field's directive(s) to determine which type/nullability overrides to apply */
  protected _evaluateFieldDirectives(directives: ReadonlyArray<DirectiveNode>): NormalizedDirectiveFieldSetting {
    const mappings = this.config.directiveFieldMappings;
    return Object.assign(
      {},
      ...directives.map(directive => {
        let fieldSettings = { ...(mappings[directive.name.value] || {}) };
        if (fieldSettings.type) {
          const type =
            this._maybeResolveDirectiveExpression(fieldSettings.type, directive, String) ?? fieldSettings.type;
          if (type) {
            fieldSettings = { ...fieldSettings, ...parseMapper(String(type), directive.name.value) };
          }
        }
        ['nullable', 'nullableEntries'].forEach(key => {
          let setting = fieldSettings[key];
          if (typeof setting !== 'string') return;
          setting = this._maybeResolveDirectiveExpression(setting, directive, arg =>
            typeof arg === 'boolean' ? arg : undefined
          );
          if (typeof setting !== 'undefined') {
            fieldSettings[key] = setting;
          } else {
            delete fieldSettings[key];
          }
        });
        return fieldSettings;
      })
    );
  }

  /** Resolve a directive argument expression (e.g. "$argName") into a value (e.g. true) */
  protected _maybeResolveDirectiveExpression<T>(
    expression: string,
    directive: DirectiveNode,
    cast: (arg: any) => T | undefined
  ): T | undefined {
    if (!expression.match(/^!?\$\w+$/)) return undefined;
    const [negate, argName] = expression.split('$');
    const directiveDefinition = this.schema.getDirective(directive.name.value);
    const defaultValue = directiveDefinition?.args.find(arg => arg.name === argName)?.defaultValue;
    const valueNode = directive.arguments?.find(arg => arg.name.value === argName)?.value as { value: any };
    const value = valueNode?.value ?? defaultValue;
    if (typeof value === 'undefined') return undefined;
    return cast(negate ? !value : value);
  }
}
