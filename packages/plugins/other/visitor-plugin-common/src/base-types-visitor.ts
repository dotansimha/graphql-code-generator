import {
  DirectiveDefinitionNode,
  DirectiveNode,
  EnumTypeDefinitionNode,
  EnumValueDefinitionNode,
  FieldDefinitionNode,
  GraphQLEnumType,
  GraphQLSchema,
  InputObjectTypeDefinitionNode,
  InputValueDefinitionNode,
  InterfaceTypeDefinitionNode,
  isEnumType,
  Kind,
  ListTypeNode,
  NamedTypeNode,
  NameNode,
  NonNullTypeNode,
  ObjectTypeDefinitionNode,
  ScalarTypeDefinitionNode,
  StringValueNode,
  UnionTypeDefinitionNode,
} from 'graphql';
import { BaseVisitor, ParsedConfig, RawConfig } from './base-visitor.js';
import { normalizeDeclarationKind } from './declaration-kinds.js';
import { parseEnumValues } from './enum-values.js';
import { transformDirectiveArgumentAndInputFieldMappings } from './mappers.js';
import { DEFAULT_SCALARS } from './scalars.js';
import {
  DeclarationKind,
  DeclarationKindConfig,
  DirectiveArgumentAndInputFieldMappings,
  EnumValuesMap,
  NormalizedScalarsMap,
  ParsedDirectiveArgumentAndInputFieldMappings,
  ParsedEnumValuesMap,
} from './types.js';
import {
  buildScalarsFromConfig,
  DeclarationBlock,
  DeclarationBlockConfig,
  getConfigValue,
  indent,
  isOneOfInputObjectType,
  transformComment,
  wrapWithSingleQuotes,
} from './utils.js';
import { OperationVariablesToObject } from './variables-to-object.js';

export interface ParsedTypesConfig extends ParsedConfig {
  enumValues: ParsedEnumValuesMap;
  declarationKind: DeclarationKindConfig;
  addUnderscoreToArgsType: boolean;
  onlyEnums: boolean;
  onlyOperationTypes: boolean;
  enumPrefix: boolean;
  fieldWrapperValue: string;
  wrapFieldDefinitions: boolean;
  entireFieldWrapperValue: string;
  wrapEntireDefinitions: boolean;
  ignoreEnumValuesFromSchema: boolean;
  directiveArgumentAndInputFieldMappings: ParsedDirectiveArgumentAndInputFieldMappings;
}

export interface RawTypesConfig extends RawConfig {
  /**
   * @description Adds `_` to generated `Args` types in order to avoid duplicate identifiers.
   *
   * @exampleMarkdown
   * ## With Custom Values
   *
   * ```ts filename="codegen.ts"
   *  import type { CodegenConfig } from '@graphql-codegen/cli';
   *
   *  const config: CodegenConfig = {
   *    // ...
   *    generates: {
   *      'path/to/file': {
   *        // plugins...
   *        config: {
   *          addUnderscoreToArgsType: true
   *        },
   *      },
   *    },
   *  };
   *  export default config;
   * ```
   */
  addUnderscoreToArgsType?: boolean;
  /**
   * @description Overrides the default value of enum values declared in your GraphQL schema.
   * You can also map the entire enum to an external type by providing a string that of `module#type`.
   *
   * @exampleMarkdown
   * ## With Custom Values
   * ```ts filename="codegen.ts"
   *  import type { CodegenConfig } from '@graphql-codegen/cli';
   *
   *  const config: CodegenConfig = {
   *    // ...
   *    generates: {
   *      'path/to/file': {
   *        // plugins...
   *        config: {
   *          enumValues: {
   *            MyEnum: {
   *              A: 'foo'
   *            }
   *          }
   *        },
   *      },
   *    },
   *  };
   *  export default config;
   * ```
   *
   * ## With External Enum
   * ```ts filename="codegen.ts"
   *  import type { CodegenConfig } from '@graphql-codegen/cli';
   *
   *  const config: CodegenConfig = {
   *    // ...
   *    generates: {
   *      'path/to/file': {
   *        // plugins...
   *        config: {
   *          enumValues: {
   *            MyEnum: './my-file#MyCustomEnum',
   *          }
   *        },
   *      },
   *    },
   *  };
   *  export default config;
   * ```
   *
   * ## Import All Enums from a file
   * ```ts filename="codegen.ts"
   *  import type { CodegenConfig } from '@graphql-codegen/cli';
   *
   *  const config: CodegenConfig = {
   *    // ...
   *    generates: {
   *      'path/to/file': {
   *        // plugins...
   *        config: {
   *          enumValues: {
   *            MyEnum: './my-file',
   *          }
   *        },
   *      },
   *    },
   *  };
   *  export default config;
   * ```
   */
  enumValues?: EnumValuesMap;
  /**
   * @description Overrides the default output for various GraphQL elements.
   *
   * @exampleMarkdown
   * ## Override all declarations
   *
   * ```ts filename="codegen.ts"
   *  import type { CodegenConfig } from '@graphql-codegen/cli';
   *
   *  const config: CodegenConfig = {
   *    // ...
   *    generates: {
   *      'path/to/file': {
   *        // plugins...
   *        config: {
   *          declarationKind: 'interface'
   *        },
   *      },
   *    },
   *  };
   *  export default config;
   * ```
   *
   * ## Override only specific declarations
   *
   * ```ts filename="codegen.ts"
   *  import type { CodegenConfig } from '@graphql-codegen/cli';
   *
   *  const config: CodegenConfig = {
   *    // ...
   *    generates: {
   *      'path/to/file': {
   *        // plugins...
   *        config: {
   *          declarationKind: {
   *            type: 'interface',
   *            input: 'interface'
   *          }
   *        },
   *      },
   *    },
   *  };
   *  export default config;
   * ```
   */
  declarationKind?: DeclarationKind | DeclarationKindConfig;
  /**
   * @default true
   * @description Allow you to disable prefixing for generated enums, works in combination with `typesPrefix`.
   *
   * @exampleMarkdown
   * ## Disable enum prefixes
   *
   * ```ts filename="codegen.ts"
   *  import type { CodegenConfig } from '@graphql-codegen/cli';
   *
   *  const config: CodegenConfig = {
   *    // ...
   *    generates: {
   *      'path/to/file': {
   *        // plugins...
   *        config: {
   *          typesPrefix: 'I',
   *          enumPrefix: false
   *        },
   *      },
   *    },
   *  };
   *  export default config;
   * ```
   */
  enumPrefix?: boolean;
  /**
   * @description Allow you to add wrapper for field type, use T as the generic value. Make sure to set `wrapFieldDefinitions` to `true` in order to make this flag work.
   * @default T
   *
   * @exampleMarkdown
   * ## Allow Promise
   *
   * ```ts filename="codegen.ts"
   *  import type { CodegenConfig } from '@graphql-codegen/cli';
   *
   *  const config: CodegenConfig = {
   *    // ...
   *    generates: {
   *      'path/to/file': {
   *        // plugins...
   *        config: {
   *          wrapFieldDefinitions: true,
   *          fieldWrapperValue: 'T | Promise<T>',
   *        },
   *      },
   *    },
   *  };
   *  export default config;
   * ```
   */
  fieldWrapperValue?: string;
  /**
   * @description Set to `true` in order to wrap field definitions with `FieldWrapper`.
   * This is useful to allow return types such as Promises and functions.
   * @default false
   *
   * @exampleMarkdown
   * ## Enable wrapping fields
   *
   * ```ts filename="codegen.ts"
   *  import type { CodegenConfig } from '@graphql-codegen/cli';
   *
   *  const config: CodegenConfig = {
   *    // ...
   *    generates: {
   *      'path/to/file': {
   *        // plugins...
   *        config: {
   *          wrapFieldDefinitions: true,
   *        },
   *      },
   *    },
   *  };
   *  export default config;
   * ```
   */
  wrapFieldDefinitions?: boolean;
  /**
   * @description This will cause the generator to emit types for enums only
   * @default false
   *
   * @exampleMarkdown
   * ## Override all definition types
   *
   * ```ts filename="codegen.ts"
   *  import type { CodegenConfig } from '@graphql-codegen/cli';
   *
   *  const config: CodegenConfig = {
   *    // ...
   *    generates: {
   *      'path/to/file': {
   *        // plugins...
   *        config: {
   *          onlyEnums: true,
   *        },
   *      },
   *    },
   *  };
   *  export default config;
   * ```
   */
  onlyEnums?: boolean;
  /**
   * @description This will cause the generator to emit types for operations only (basically only enums and scalars)
   * @default false
   *
   * @exampleMarkdown
   * ## Override all definition types
   *
   * ```ts filename="codegen.ts"
   *  import type { CodegenConfig } from '@graphql-codegen/cli';
   *
   *  const config: CodegenConfig = {
   *    // ...
   *    generates: {
   *      'path/to/file': {
   *        // plugins...
   *        config: {
   *          onlyOperationTypes: true,
   *        },
   *      },
   *    },
   *  };
   *  export default config;
   * ```
   */
  onlyOperationTypes?: boolean;
  /**
   * @description This will cause the generator to ignore enum values defined in GraphQLSchema
   * @default false
   *
   * @exampleMarkdown
   * ## Ignore enum values from schema
   *
   * ```ts filename="codegen.ts"
   *  import type { CodegenConfig } from '@graphql-codegen/cli';
   *
   *  const config: CodegenConfig = {
   *    // ...
   *    generates: {
   *      'path/to/file': {
   *        // plugins...
   *        config: {
   *          ignoreEnumValuesFromSchema: true,
   *        },
   *      },
   *    },
   *  };
   *  export default config;
   * ```
   */
  ignoreEnumValuesFromSchema?: boolean;
  /**
   * @name wrapEntireFieldDefinitions
   * @type boolean
   * @description Set to `true` in order to wrap field definitions with `EntireFieldWrapper`.
   * This is useful to allow return types such as Promises and functions for fields.
   * Differs from `wrapFieldDefinitions` in that this wraps the entire field definition if i.e. the field is an Array, while
   * `wrapFieldDefinitions` will wrap every single value inside the array.
   * @default true
   *
   * @example Enable wrapping entire fields
   * ```ts filename="codegen.ts"
   *  import type { CodegenConfig } from '@graphql-codegen/cli';
   *
   *  const config: CodegenConfig = {
   *    // ...
   *    generates: {
   *      'path/to/file': {
   *        // plugins...
   *        config: {
   *          wrapEntireFieldDefinitions: false,
   *        },
   *      },
   *    },
   *  };
   *  export default config;
   * ```
   */
  wrapEntireFieldDefinitions?: boolean;
  /**
   * @name entireFieldWrapperValue
   * @type string
   * @description Allow to override the type value of `EntireFieldWrapper`. This wrapper applies outside of Array and Maybe
   * unlike `fieldWrapperValue`, that will wrap the inner type.
   * @default T | Promise<T> | (() => T | Promise<T>)
   *
   * @example Only allow values
   * ```ts filename="codegen.ts"
   *  import type { CodegenConfig } from '@graphql-codegen/cli';
   *
   *  const config: CodegenConfig = {
   *    // ...
   *    generates: {
   *      'path/to/file': {
   *        // plugins...
   *        config: {
   *          entireFieldWrapperValue: 'T',
   *        },
   *      },
   *    },
   *  };
   *  export default config;
   * ```
   */
  entireFieldWrapperValue?: string;
  /**
   * @description Replaces a GraphQL scalar with a custom type based on the applied directive on an argument or input field.
   *
   * You can use both `module#type` and `module#namespace#type` syntax.
   * Will NOT work with introspected schemas since directives are not exported.
   * Only works with directives on ARGUMENT_DEFINITION or INPUT_FIELD_DEFINITION.
   *
   * **WARNING:** Using this option does only change the type definitions.
   *
   * For actually ensuring that a type is correct at runtime you will have to use schema transforms (e.g. with [@graphql-tools/utils mapSchema](https://graphql-tools.com/docs/schema-directives)) that apply those rules!
   * Otherwise, you might end up with a runtime type mismatch which could cause unnoticed bugs or runtime errors.
   *
   * Please use this configuration option with care!
   *
   * @exampleMarkdown
   * ## Custom Context Type\
   * ```ts filename="codegen.ts"
   *  import type { CodegenConfig } from '@graphql-codegen/cli';
   *
   *  const config: CodegenConfig = {
   *    // ...
   *    generates: {
   *      'path/to/file': {
   *        // plugins...
   *        config: {
   *          directiveArgumentAndInputFieldMappings: {
   *            AsNumber: 'number',
   *            AsComplex: './my-models#Complex',
   *          }
   *        },
   *      },
   *    },
   *  };
   *  export default config;
   * ```
   */
  directiveArgumentAndInputFieldMappings?: DirectiveArgumentAndInputFieldMappings;
  /**
   * @description Adds a suffix to the imported names to prevent name clashes.
   *
   * @exampleMarkdown
   * ```ts filename="codegen.ts"
   *  import type { CodegenConfig } from '@graphql-codegen/cli';
   *
   *  const config: CodegenConfig = {
   *    // ...
   *    generates: {
   *      'path/to/file': {
   *        // plugins...
   *        config: {
   *          directiveArgumentAndInputFieldMappings: 'Model'
   *        },
   *      },
   *    },
   *  };
   *  export default config;
   * ```
   */
  directiveArgumentAndInputFieldMappingTypeSuffix?: string;
}

export class BaseTypesVisitor<
  TRawConfig extends RawTypesConfig = RawTypesConfig,
  TPluginConfig extends ParsedTypesConfig = ParsedTypesConfig
> extends BaseVisitor<TRawConfig, TPluginConfig> {
  protected _argumentsTransformer: OperationVariablesToObject;

  constructor(
    protected _schema: GraphQLSchema,
    rawConfig: TRawConfig,
    additionalConfig: TPluginConfig,
    defaultScalars: NormalizedScalarsMap = DEFAULT_SCALARS
  ) {
    super(rawConfig, {
      enumPrefix: getConfigValue(rawConfig.enumPrefix, true),
      onlyEnums: getConfigValue(rawConfig.onlyEnums, false),
      onlyOperationTypes: getConfigValue(rawConfig.onlyOperationTypes, false),
      addUnderscoreToArgsType: getConfigValue(rawConfig.addUnderscoreToArgsType, false),
      enumValues: parseEnumValues({
        schema: _schema,
        mapOrStr: rawConfig.enumValues,
        ignoreEnumValuesFromSchema: rawConfig.ignoreEnumValuesFromSchema,
      }),
      declarationKind: normalizeDeclarationKind(rawConfig.declarationKind),
      scalars: buildScalarsFromConfig(_schema, rawConfig, defaultScalars),
      fieldWrapperValue: getConfigValue(rawConfig.fieldWrapperValue, 'T'),
      wrapFieldDefinitions: getConfigValue(rawConfig.wrapFieldDefinitions, false),
      entireFieldWrapperValue: getConfigValue(rawConfig.entireFieldWrapperValue, 'T'),
      wrapEntireDefinitions: getConfigValue(rawConfig.wrapEntireFieldDefinitions, false),
      ignoreEnumValuesFromSchema: getConfigValue(rawConfig.ignoreEnumValuesFromSchema, false),
      directiveArgumentAndInputFieldMappings: transformDirectiveArgumentAndInputFieldMappings(
        rawConfig.directiveArgumentAndInputFieldMappings ?? {},
        rawConfig.directiveArgumentAndInputFieldMappingTypeSuffix
      ),
      ...additionalConfig,
    });

    // Note: Missing directive mappers but not a problem since always overriden by implementors
    this._argumentsTransformer = new OperationVariablesToObject(this.scalars, this.convertName);
  }

  protected getExportPrefix(): string {
    return 'export ';
  }

  public getFieldWrapperValue(): string {
    if (this.config.fieldWrapperValue) {
      return `${this.getExportPrefix()}type FieldWrapper<T> = ${this.config.fieldWrapperValue};`;
    }

    return '';
  }

  public getEntireFieldWrapperValue(): string {
    if (this.config.entireFieldWrapperValue) {
      return `${this.getExportPrefix()}type EntireFieldWrapper<T> = ${this.config.entireFieldWrapperValue};`;
    }

    return '';
  }

  public getScalarsImports(): string[] {
    return Object.keys(this.config.scalars)
      .map(enumName => {
        const mappedValue = this.config.scalars[enumName];

        if (mappedValue.isExternal) {
          return this._buildTypeImport(mappedValue.import, mappedValue.source, mappedValue.default);
        }

        return null;
      })
      .filter(a => a);
  }

  public getDirectiveArgumentAndInputFieldMappingsImports(): string[] {
    return Object.keys(this.config.directiveArgumentAndInputFieldMappings)
      .map(directive => {
        const mappedValue = this.config.directiveArgumentAndInputFieldMappings[directive];

        if (mappedValue.isExternal) {
          return this._buildTypeImport(mappedValue.import, mappedValue.source, mappedValue.default);
        }

        return null;
      })
      .filter(a => a);
  }

  public get scalarsDefinition(): string {
    if (this.config.onlyEnums) return '';
    const allScalars = Object.keys(this.config.scalars).map(scalarName => {
      const scalarValue = this.config.scalars[scalarName].type;
      const scalarType = this._schema.getType(scalarName);
      const comment = scalarType?.astNode && scalarType.description ? transformComment(scalarType.description, 1) : '';
      const { scalar } = this._parsedConfig.declarationKind;

      return comment + indent(`${scalarName}: ${scalarValue}${this.getPunctuation(scalar)}`);
    });

    return new DeclarationBlock(this._declarationBlockConfig)
      .export()
      .asKind(this._parsedConfig.declarationKind.scalar)
      .withName('Scalars')
      .withComment('All built-in and custom scalars, mapped to their actual values')
      .withBlock(allScalars.join('\n')).string;
  }

  public get directiveArgumentAndInputFieldMappingsDefinition(): string {
    const directiveEntries = Object.entries(this.config.directiveArgumentAndInputFieldMappings);
    if (directiveEntries.length === 0) {
      return '';
    }

    const allDirectives: Array<string> = [];

    for (const [directiveName, parsedMapper] of directiveEntries) {
      const directiveType = this._schema.getDirective(directiveName);
      const comment =
        directiveType?.astNode && directiveType.description ? transformComment(directiveType.description, 1) : '';
      const { directive } = this._parsedConfig.declarationKind;
      allDirectives.push(comment + indent(`${directiveName}: ${parsedMapper.type}${this.getPunctuation(directive)}`));
    }

    return new DeclarationBlock(this._declarationBlockConfig)
      .export()
      .asKind(this._parsedConfig.declarationKind.directive)
      .withName('DirectiveArgumentAndInputFieldMappings')
      .withComment('Type overrides using directives')
      .withBlock(allDirectives.join('\n')).string;
  }

  setDeclarationBlockConfig(config: DeclarationBlockConfig): void {
    this._declarationBlockConfig = config;
  }

  setArgumentsTransformer(argumentsTransfomer: OperationVariablesToObject): void {
    this._argumentsTransformer = argumentsTransfomer;
  }

  NonNullType(node: NonNullTypeNode): string {
    const asString = node.type as any as string;

    return asString;
  }

  getInputObjectDeclarationBlock(node: InputObjectTypeDefinitionNode): DeclarationBlock {
    return new DeclarationBlock(this._declarationBlockConfig)
      .export()
      .asKind(this._parsedConfig.declarationKind.input)
      .withName(this.convertName(node))
      .withComment(node.description as any as string)
      .withBlock(node.fields.join('\n'));
  }

  getInputObjectOneOfDeclarationBlock(node: InputObjectTypeDefinitionNode): DeclarationBlock {
    // As multiple fields always result in a union, we have
    // to force a declaration kind of `type` in this case
    const declarationKind = node.fields.length === 1 ? this._parsedConfig.declarationKind.input : 'type';
    return new DeclarationBlock(this._declarationBlockConfig)
      .export()
      .asKind(declarationKind)
      .withName(this.convertName(node))
      .withComment(node.description as any as string)
      .withContent(`\n` + node.fields.join('\n  |'));
  }

  InputObjectTypeDefinition(node: InputObjectTypeDefinitionNode): string {
    if (this.config.onlyEnums) return '';

    // Why the heck is node.name a string and not { value: string } at runtime ?!
    if (isOneOfInputObjectType(this._schema.getType(node.name as unknown as string))) {
      return this.getInputObjectOneOfDeclarationBlock(node).string;
    }

    return this.getInputObjectDeclarationBlock(node).string;
  }

  InputValueDefinition(node: InputValueDefinitionNode): string {
    if (this.config.onlyEnums) return '';

    const comment = transformComment(node.description as any as string, 1);
    const { input } = this._parsedConfig.declarationKind;

    let type: string = node.type as any as string;
    if (node.directives && this.config.directiveArgumentAndInputFieldMappings) {
      type = this._getDirectiveOverrideType(node.directives) || type;
    }

    return comment + indent(`${node.name}: ${type}${this.getPunctuation(input)}`);
  }

  Name(node: NameNode): string {
    return node.value;
  }

  FieldDefinition(node: FieldDefinitionNode): string {
    if (this.config.onlyEnums) return '';

    const typeString = node.type as any as string;
    const { type } = this._parsedConfig.declarationKind;
    const comment = this.getNodeComment(node);

    return comment + indent(`${node.name}: ${typeString}${this.getPunctuation(type)}`);
  }

  UnionTypeDefinition(node: UnionTypeDefinitionNode, key: string | number | undefined, parent: any): string {
    if (this.config.onlyOperationTypes || this.config.onlyEnums) return '';
    const originalNode = parent[key] as UnionTypeDefinitionNode;
    const possibleTypes = originalNode.types
      .map(t => (this.scalars[t.name.value] ? this._getScalar(t.name.value) : this.convertName(t)))
      .join(' | ');

    return new DeclarationBlock(this._declarationBlockConfig)
      .export()
      .asKind('type')
      .withName(this.convertName(node))
      .withComment(node.description as any as string)
      .withContent(possibleTypes).string;
  }

  protected getInterfaceJoiner(type: DeclarationKind): string {
    switch (type) {
      case 'type':
        return ' & ';
      case 'interface':
      case 'class':
      case 'abstract class':
        return ', ';
    }
  }

  protected getInterfaceKeyword(type: DeclarationKind): string {
    const { interface: interfacesType } = this._parsedConfig.declarationKind;
    switch (type) {
      case 'type':
        return '';
      case 'interface':
        return 'extends ';
      case 'class':
      case 'abstract class':
        return interfacesType === 'class' || interfacesType === 'abstract class' ? 'extends ' : 'implements ';
    }
  }

  protected mergeInterfaces(interfaces: string[], hasOtherFields: boolean, type: DeclarationKind = 'type'): string {
    if (interfaces.length) {
      return `${this.getInterfaceKeyword(type)}${interfaces.join(this.getInterfaceJoiner(type))}${
        hasOtherFields ? (type === 'type' ? ' & ' : ' ') : ''
      }`;
    }

    return '';
  }

  appendInterfacesAndFieldsToBlock(
    block: DeclarationBlock,
    interfaces: string[],
    fields: string[],
    type: DeclarationKind = 'type'
  ): void {
    block.withContent(this.mergeInterfaces(interfaces, fields.length > 0, type));
    block.withBlock(this.mergeAllFields(fields, interfaces.length > 0));
  }

  protected prependTypenameToFields(typename: string, fields: readonly FieldDefinitionNode[]): string[] {
    const optionalTypename = this.config.nonOptionalTypename ? '__typename' : '__typename?';
    const { type } = this._parsedConfig.declarationKind;
    return [
      ...(this.config.addTypename
        ? [
            indent(
              `${this.config.immutableTypes ? 'readonly ' : ''}${optionalTypename}: '${typename}'${this.getPunctuation(
                type
              )}`
            ),
          ]
        : []),
      ...fields,
    ] as string[];
  }

  protected getInterfacesNames(interfaces: readonly NamedTypeNode[]) {
    return interfaces.map(i => this.convertName(i));
  }

  getObjectTypeDeclarationBlock(
    node: ObjectTypeDefinitionNode,
    originalNode: ObjectTypeDefinitionNode
  ): DeclarationBlock {
    const { type } = this._parsedConfig.declarationKind;

    const declarationBlock = new DeclarationBlock(this._declarationBlockConfig)
      .export()
      .asKind(type)
      .withName(this.convertName(node))
      .withComment(node.description as any as string);

    const allFields = this.prependTypenameToFields(`${node.name}`, node.fields);
    const interfacesNames = this.getInterfacesNames(originalNode.interfaces);
    this.appendInterfacesAndFieldsToBlock(declarationBlock, interfacesNames, allFields, type);

    return declarationBlock;
  }

  protected mergeAllFields(allFields: string[], _hasInterfaces: boolean): string {
    return allFields.join('\n');
  }

  ObjectTypeDefinition(node: ObjectTypeDefinitionNode, key: number | string, parent: any): string {
    if (this.config.onlyOperationTypes || this.config.onlyEnums) return '';
    const originalNode = parent[key] as ObjectTypeDefinitionNode;

    return [this.getObjectTypeDeclarationBlock(node, originalNode).string, this.buildArgumentsBlock(originalNode)]
      .filter(f => f)
      .join('\n\n');
  }

  getInterfaceTypeDeclarationBlock(
    node: InterfaceTypeDefinitionNode,
    _originalNode: InterfaceTypeDefinitionNode
  ): DeclarationBlock {
    const { interface: interfacesType } = this._parsedConfig.declarationKind;
    const declarationBlock = new DeclarationBlock(this._declarationBlockConfig)
      .export()
      .asKind(interfacesType)
      .withName(this.convertName(node))
      .withComment(node.description as any as string);

    const interfacesNames = this.getInterfacesNames(_originalNode.interfaces);
    this.appendInterfacesAndFieldsToBlock(
      declarationBlock,
      interfacesNames,
      node.fields.map(f => `${f}`),
      interfacesType
    );

    return declarationBlock;
  }

  InterfaceTypeDefinition(node: InterfaceTypeDefinitionNode, key: number | string, parent: any): string {
    if (this.config.onlyOperationTypes || this.config.onlyEnums) return '';
    const originalNode = parent[key] as InterfaceTypeDefinitionNode;

    return [this.getInterfaceTypeDeclarationBlock(node, originalNode).string, this.buildArgumentsBlock(originalNode)]
      .filter(f => f)
      .join('\n\n');
  }

  ScalarTypeDefinition(_node: ScalarTypeDefinitionNode): string {
    // We empty this because we handle scalars in a different way, see constructor.
    return '';
  }

  protected _buildTypeImport(identifier: string, source: string, asDefault = false): string {
    const { useTypeImports } = this.config;
    if (asDefault) {
      if (useTypeImports) {
        return `import type { default as ${identifier} } from '${source}';`;
      }
      return `import ${identifier} from '${source}';`;
    }
    return `import${useTypeImports ? ' type' : ''} { ${identifier} } from '${source}';`;
  }

  protected handleEnumValueMapper(
    typeIdentifier: string,
    importIdentifier: string | null,
    sourceIdentifier: string | null,
    sourceFile: string | null
  ): string[] {
    if (importIdentifier !== sourceIdentifier) {
      // use namespace import to dereference nested enum
      // { enumValues: { MyEnum: './my-file#NS.NestedEnum' } }
      return [
        this._buildTypeImport(importIdentifier || sourceIdentifier, sourceFile),
        `import ${typeIdentifier} = ${sourceIdentifier};`,
      ];
    }
    if (sourceIdentifier !== typeIdentifier) {
      return [this._buildTypeImport(`${sourceIdentifier} as ${typeIdentifier}`, sourceFile)];
    }
    return [this._buildTypeImport(importIdentifier || sourceIdentifier, sourceFile)];
  }

  public getEnumsImports(): string[] {
    return Object.keys(this.config.enumValues)
      .flatMap(enumName => {
        const mappedValue = this.config.enumValues[enumName];

        if (mappedValue.sourceFile) {
          if (mappedValue.isDefault) {
            return [this._buildTypeImport(mappedValue.typeIdentifier, mappedValue.sourceFile, true)];
          }

          return this.handleEnumValueMapper(
            mappedValue.typeIdentifier,
            mappedValue.importIdentifier,
            mappedValue.sourceIdentifier,
            mappedValue.sourceFile
          );
        }

        return [];
      })
      .filter(Boolean);
  }

  EnumTypeDefinition(node: EnumTypeDefinitionNode): string {
    const enumName = node.name as any as string;

    // In case of mapped external enum string
    if (this.config.enumValues[enumName]?.sourceFile) {
      return null;
    }

    return new DeclarationBlock(this._declarationBlockConfig)
      .export()
      .asKind('enum')
      .withName(this.convertName(node, { useTypesPrefix: this.config.enumPrefix }))
      .withComment(node.description as any as string)
      .withBlock(this.buildEnumValuesBlock(enumName, node.values)).string;
  }

  // We are using it in order to transform "description" field
  StringValue(node: StringValueNode): string {
    return node.value;
  }

  protected makeValidEnumIdentifier(identifier: string): string {
    if (/^[0-9]/.exec(identifier)) {
      return wrapWithSingleQuotes(identifier, true);
    }
    return identifier;
  }

  protected buildEnumValuesBlock(typeName: string, values: ReadonlyArray<EnumValueDefinitionNode>): string {
    const schemaEnumType: GraphQLEnumType | undefined = this._schema
      ? (this._schema.getType(typeName) as GraphQLEnumType)
      : undefined;

    return values
      .map(enumOption => {
        const optionName = this.makeValidEnumIdentifier(
          this.convertName(enumOption, {
            useTypesPrefix: false,
            transformUnderscore: true,
          })
        );
        const comment = this.getNodeComment(enumOption);
        const schemaEnumValue =
          schemaEnumType && !this.config.ignoreEnumValuesFromSchema
            ? schemaEnumType.getValue(enumOption.name as any).value
            : undefined;
        let enumValue: string | number =
          typeof schemaEnumValue === 'undefined' ? (enumOption.name as any) : schemaEnumValue;

        if (
          this.config.enumValues[typeName]?.mappedValues &&
          typeof this.config.enumValues[typeName].mappedValues[enumValue] !== 'undefined'
        ) {
          enumValue = this.config.enumValues[typeName].mappedValues[enumValue];
        }

        return (
          comment +
          indent(
            `${optionName}${this._declarationBlockConfig.enumNameValueSeparator} ${wrapWithSingleQuotes(
              enumValue,
              typeof schemaEnumValue !== 'undefined'
            )}`
          )
        );
      })
      .join(',\n');
  }

  DirectiveDefinition(_node: DirectiveDefinitionNode): string {
    return '';
  }

  getArgumentsObjectDeclarationBlock(
    node: InterfaceTypeDefinitionNode | ObjectTypeDefinitionNode,
    name: string,
    field: FieldDefinitionNode
  ): DeclarationBlock {
    return new DeclarationBlock(this._declarationBlockConfig)
      .export()
      .asKind(this._parsedConfig.declarationKind.arguments)
      .withName(this.convertName(name))
      .withComment(node.description)
      .withBlock(this._argumentsTransformer.transform<InputValueDefinitionNode>(field.arguments));
  }

  getArgumentsObjectTypeDefinition(
    node: InterfaceTypeDefinitionNode | ObjectTypeDefinitionNode,
    name: string,
    field: FieldDefinitionNode
  ): string {
    if (this.config.onlyEnums) return '';
    return this.getArgumentsObjectDeclarationBlock(node, name, field).string;
  }

  protected buildArgumentsBlock(node: InterfaceTypeDefinitionNode | ObjectTypeDefinitionNode) {
    const fieldsWithArguments = node.fields.filter(field => field.arguments && field.arguments.length > 0) || [];
    return fieldsWithArguments
      .map(field => {
        const name =
          node.name.value +
          (this.config.addUnderscoreToArgsType ? '_' : '') +
          this.convertName(field, {
            useTypesPrefix: false,
            useTypesSuffix: false,
          }) +
          'Args';

        return this.getArgumentsObjectTypeDefinition(node, name, field);
      })
      .join('\n\n');
  }

  protected _getScalar(name: string): string {
    return `Scalars['${name}']`;
  }

  protected _getDirectiveArgumentNadInputFieldMapping(name: string): string {
    return `DirectiveArgumentAndInputFieldMappings['${name}']`;
  }

  protected _getDirectiveOverrideType(directives: ReadonlyArray<DirectiveNode>): string | null {
    const type = directives
      .map(directive => {
        const directiveName = directive.name as any as string;
        if (this.config.directiveArgumentAndInputFieldMappings[directiveName]) {
          return this._getDirectiveArgumentNadInputFieldMapping(directiveName);
        }
        return null;
      })
      .reverse()
      .find(a => !!a);

    return type || null;
  }

  protected _getTypeForNode(node: NamedTypeNode): string {
    const typeAsString = node.name as any as string;

    if (this.scalars[typeAsString]) {
      return this._getScalar(typeAsString);
    }
    if (this.config.enumValues[typeAsString]) {
      return this.config.enumValues[typeAsString].typeIdentifier;
    }

    const schemaType = this._schema.getType(node.name as any);

    if (schemaType && isEnumType(schemaType)) {
      return this.convertName(node, { useTypesPrefix: this.config.enumPrefix });
    }

    return this.convertName(node);
  }

  NamedType(node: NamedTypeNode, key, parent, path, ancestors): string {
    const currentVisitContext = this.getVisitorKindContextFromAncestors(ancestors);
    const isVisitingInputType = currentVisitContext.includes(Kind.INPUT_OBJECT_TYPE_DEFINITION);
    const typeToUse = this._getTypeForNode(node);

    if (!isVisitingInputType && this.config.fieldWrapperValue && this.config.wrapFieldDefinitions) {
      return `FieldWrapper<${typeToUse}>`;
    }

    return typeToUse;
  }

  ListType(node: ListTypeNode, _key, _parent, _path, _ancestors): string {
    const asString = node.type as any as string;

    return this.wrapWithListType(asString);
  }

  SchemaDefinition() {
    return null;
  }

  getNodeComment(node: FieldDefinitionNode | EnumValueDefinitionNode | InputValueDefinitionNode): string {
    let commentText: string = node.description as any;
    const deprecationDirective = node.directives.find((v: any) => v.name === 'deprecated');
    if (deprecationDirective) {
      const deprecationReason = this.getDeprecationReason(deprecationDirective);
      commentText = `${commentText ? `${commentText}\n` : ''}@deprecated ${deprecationReason}`;
    }
    const comment = transformComment(commentText, 1);
    return comment;
  }

  protected getDeprecationReason(directive: DirectiveNode): string | void {
    if ((directive.name as any) === 'deprecated') {
      const hasArguments = directive.arguments.length > 0;
      let reason = 'Field no longer supported';
      if (hasArguments) {
        reason = directive.arguments[0].value as any;
      }
      return reason;
    }
  }

  protected wrapWithListType(str: string): string {
    return `Array<${str}>`;
  }
}
