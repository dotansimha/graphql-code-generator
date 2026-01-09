import autoBind from 'auto-bind';
import { pascalCase } from 'change-case-all';
import {
  FragmentDefinitionNode,
  GraphQLSchema,
  OperationDefinitionNode,
  OperationTypeNode,
  VariableDefinitionNode,
} from 'graphql';
import { BaseVisitor, type RawConfig, type ParsedConfig } from './base-visitor.js';
import { DEFAULT_SCALARS } from './scalars.js';
import { SelectionSetToObject } from './selection-set-to-object.js';
import { NormalizedScalarsMap, CustomDirectivesConfig } from './types.js';
import { buildScalarsFromConfig, DeclarationBlock, DeclarationBlockConfig, getConfigValue } from './utils.js';
import { OperationVariablesToObject } from './variables-to-object.js';

export interface ParsedDocumentsConfig extends ParsedConfig {
  extractAllFieldsToTypes: boolean;
  extractAllFieldsToTypesCompact: boolean;
  operationResultSuffix: string;
  dedupeOperationSuffix: boolean;
  omitOperationSuffix: boolean;
  namespacedImportName: string | null;
  exportFragmentSpreadSubTypes: boolean;
  skipTypeNameForRoot: boolean;
  nonOptionalTypename: boolean;
  globalNamespace: boolean;
  experimentalFragmentVariables: boolean;
  mergeFragmentTypes: boolean;
  customDirectives: CustomDirectivesConfig;
  generatesOperationTypes: boolean;
  importSchemaTypesFrom: string;
}

export interface RawDocumentsConfig extends RawConfig {
  /**
   * @default false
   * @description Avoid adding `__typename` for root types. This is ignored when a selection explicitly specifies `__typename`.
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
   *          skipTypeNameForRoot: true
   *        },
   *      },
   *    },
   *  };
   *  export default config;
   * ```
   */
  skipTypeNameForRoot?: boolean;
  /**
   * @default false
   * @description Automatically adds `__typename` field to the generated types, even when they are not specified
   * in the selection set, and makes it non-optional
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
   *          nonOptionalTypename: true
   *        },
   *      },
   *    },
   *  };
   *  export default config;
   * ```
   */
  nonOptionalTypename?: boolean;
  /**
   * @default false
   * @description Puts all generated code under `global` namespace. Useful for Stencil integration.
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
   *          globalNamespace: true
   *        },
   *      },
   *    },
   *  };
   *  export default config;
   * ```
   */
  globalNamespace?: boolean;
  /**
   * @default ""
   * @description Adds a suffix to generated operation result type names
   */
  operationResultSuffix?: string;
  /**
   * @default false
   * @description Set this configuration to `true` if you wish to make sure to remove duplicate operation name suffix.
   */
  dedupeOperationSuffix?: boolean;
  /**
   * @default false
   * @description Set this configuration to `true` if you wish to disable auto add suffix of operation name, like `Query`, `Mutation`, `Subscription`, `Fragment`.
   */
  omitOperationSuffix?: boolean;
  /**
   * @default false
   * @description If set to true, it will export the sub-types created in order to make it easier to access fields declared under fragment spread.
   */
  exportFragmentSpreadSubTypes?: boolean;
  /**
   * @default false
   * @description If set to true, it will enable support for parsing variables on fragments.
   */
  experimentalFragmentVariables?: boolean;
  /**
   * @default false
   * @description If set to true, merge equal fragment interfaces.
   */
  mergeFragmentTypes?: boolean;

  // The following are internal, and used by presets
  /**
   * @ignore
   */
  namespacedImportName?: string;

  /**
   * @description Configures behavior for use with custom directives from
   * various GraphQL libraries.
   * @exampleMarkdown
   * ```ts filename="codegen.ts"
   *  import type { CodegenConfig } from '@graphql-codegen/cli';
   *
   *  const config: CodegenConfig = {
   *    // ...
   *    generates: {
   *      'path/to/file.ts': {
   *        plugins: ['typescript'],
   *        config: {
   *          customDirectives: {
   *            apolloUnmask: true
   *          }
   *        },
   *      },
   *    },
   *  };
   *  export default config;
   * ```
   */
  customDirectives?: CustomDirectivesConfig;

  /**
   * @description Whether to generate operation types such as Variables, Query/Mutation/Subscription selection set, and Fragment types
   * This can be used with `importSchemaTypesFrom` to generate shared used Enums and Input.
   * @default true
   * @exampleMarkdown
   * ```ts filename="codegen.ts"
   *  import type { CodegenConfig } from '@graphql-codegen/cli';
   *
   *  const config: CodegenConfig = {
   *    // ...
   *    generates: {
   *      'path/to/file.ts': {
   *        plugins: ['typescript-operations'],
   *        config: {
   *          generatesOperationTypes: false,
   *        },
   *      },
   *    },
   *  };
   *  export default config;
   * ```
   */
  generatesOperationTypes?: boolean;

  /**
   * @description The absolute (prefixed with `~`) or relative path from `cwd` to the shared used Enums and Input (See `generatesOperationTypes`).
   * @default true
   * @exampleMarkdown
   * ```ts filename="codegen.ts"
   *  import type { CodegenConfig } from '@graphql-codegen/cli';
   *
   *  const config: CodegenConfig = {
   *    // ...
   *    generates: {
   *      'path/to/file.ts': {
   *        plugins: ['typescript-operations'],
   *        config: {
   *          importSchemaTypesFrom: './path/to/shared-types.ts', // relative
   *          importSchemaTypesFrom: '~@my-org/package' // absolute
   *        },
   *      },
   *    },
   *  };
   *  export default config;
   * ```
   */
  importSchemaTypesFrom?: string;
  /**
   * @default false
   * @description Extract all field types to their own types, instead of inlining them.
   * This helps to reduce type duplication, and makes type errors more readable.
   * It can also significantly reduce the size of the generated code, the generation time,
   * and the typechecking time.
   */
  extractAllFieldsToTypes?: boolean;
  /**
   * @default false
   * @description Generates type names using only field names, omitting GraphQL type names.
   * This matches the naming convention used by Apollo Tooling.
   * For example, instead of `Query_company_Company_office_Office_location_Location`,
   * it generates `Query_company_office_location`.
   *
   * When this option is enabled, `extractAllFieldsToTypes` is automatically enabled as well.
   */
  extractAllFieldsToTypesCompact?: boolean;
}

export class BaseDocumentsVisitor<
  TRawConfig extends RawDocumentsConfig = RawDocumentsConfig,
  TPluginConfig extends ParsedDocumentsConfig = ParsedDocumentsConfig
> extends BaseVisitor<TRawConfig, TPluginConfig> {
  protected _unnamedCounter = 1;
  protected _variablesTransfomer: OperationVariablesToObject;
  protected _selectionSetToObject: SelectionSetToObject;
  protected _globalDeclarations: Set<string> = new Set<string>();

  constructor(
    rawConfig: TRawConfig,
    additionalConfig: TPluginConfig,
    protected _schema: GraphQLSchema,
    defaultScalars: NormalizedScalarsMap = DEFAULT_SCALARS
  ) {
    super(rawConfig, {
      exportFragmentSpreadSubTypes: getConfigValue(rawConfig.exportFragmentSpreadSubTypes, false),
      dedupeOperationSuffix: getConfigValue(rawConfig.dedupeOperationSuffix, false),
      omitOperationSuffix: getConfigValue(rawConfig.omitOperationSuffix, false),
      skipTypeNameForRoot: getConfigValue(rawConfig.skipTypeNameForRoot, false),
      nonOptionalTypename: getConfigValue(rawConfig.nonOptionalTypename, false),
      namespacedImportName: getConfigValue(rawConfig.namespacedImportName, null),
      experimentalFragmentVariables: getConfigValue(rawConfig.experimentalFragmentVariables, false),
      globalNamespace: !!rawConfig.globalNamespace,
      operationResultSuffix: getConfigValue(rawConfig.operationResultSuffix, ''),
      scalars: buildScalarsFromConfig(_schema, rawConfig, defaultScalars),
      customDirectives: getConfigValue(rawConfig.customDirectives, { apolloUnmask: false }),
      generatesOperationTypes: getConfigValue(rawConfig.generatesOperationTypes, true),
      importSchemaTypesFrom: getConfigValue(rawConfig.importSchemaTypesFrom, ''),
      extractAllFieldsToTypes:
        getConfigValue(rawConfig.extractAllFieldsToTypes, false) ||
        getConfigValue(rawConfig.extractAllFieldsToTypesCompact, false),
      extractAllFieldsToTypesCompact: getConfigValue(rawConfig.extractAllFieldsToTypesCompact, false),
      ...((additionalConfig || {}) as any),
    });

    autoBind(this);
    this._variablesTransfomer = new OperationVariablesToObject(
      this.scalars,
      this.convertName,
      this.config.namespacedImportName
    );
  }

  public getGlobalDeclarations(noExport = false): string[] {
    return Array.from(this._globalDeclarations).map(t => (noExport ? t : `export ${t}`));
  }

  setSelectionSetHandler(handler: SelectionSetToObject): void {
    this._selectionSetToObject = handler;
  }

  setDeclarationBlockConfig(config: DeclarationBlockConfig): void {
    this._declarationBlockConfig = config;
  }

  setVariablesTransformer(variablesTransfomer: OperationVariablesToObject): void {
    this._variablesTransfomer = variablesTransfomer;
  }

  public get schema(): GraphQLSchema {
    return this._schema;
  }

  private handleAnonymousOperation(node: OperationDefinitionNode): string {
    const name = node.name?.value;

    if (name) {
      return this.convertName(name, {
        useTypesPrefix: false,
        useTypesSuffix: false,
      });
    }

    return this.convertName(String(this._unnamedCounter++), {
      prefix: 'Unnamed_',
      suffix: '_',
      useTypesPrefix: false,
      useTypesSuffix: false,
    });
  }

  FragmentDefinition(node: FragmentDefinitionNode): string {
    if (!this.config.generatesOperationTypes) {
      return null;
    }

    const fragmentRootType = this._schema.getType(node.typeCondition.name.value);
    const selectionSet = this._selectionSetToObject.createNext(fragmentRootType, node.selectionSet);
    const fragmentSuffix = this.getFragmentSuffix(node);
    return [
      selectionSet.transformFragmentSelectionSetToTypes(node.name.value, fragmentSuffix, this._declarationBlockConfig),
      this.config.experimentalFragmentVariables
        ? new DeclarationBlock({
            ...this._declarationBlockConfig,
            blockTransformer: t => this.applyVariablesWrapper(t),
          })
            .export()
            .asKind('type')
            .withName(
              this.convertName(node.name.value, {
                suffix: fragmentSuffix + 'Variables',
              })
            )
            .withBlock(this._variablesTransfomer.transform(node.variableDefinitions)).string
        : undefined,
    ]
      .filter(r => r)
      .join('\n\n');
  }

  protected applyVariablesWrapper(variablesBlock: string, _operationType?: string): string {
    return variablesBlock;
  }

  OperationDefinition(node: OperationDefinitionNode): string | null {
    if (!this.config.generatesOperationTypes) {
      return null;
    }

    const name = this.handleAnonymousOperation(node);
    const operationRootType = getRootType(node.operation, this._schema);

    if (!operationRootType) {
      throw new Error(`Unable to find root schema type for operation type "${node.operation}"!`);
    }

    const selectionSet = this._selectionSetToObject.createNext(operationRootType, node.selectionSet);
    const visitedOperationVariables = this._variablesTransfomer.transform<VariableDefinitionNode>(
      node.variableDefinitions
    );
    const operationType: string = pascalCase(node.operation);
    const operationTypeSuffix = this.getOperationSuffix(name, operationType);
    const selectionSetObjects = selectionSet.transformSelectionSet(
      this.convertName(name, {
        suffix: operationTypeSuffix,
      })
    );

    const operationResult = new DeclarationBlock(this._declarationBlockConfig)
      .export()
      .asKind('type')
      .withName(
        this.convertName(name, {
          suffix: operationTypeSuffix + this._parsedConfig.operationResultSuffix,
        })
      )
      .withContent(selectionSetObjects.mergedTypeString).string;

    const operationVariables = new DeclarationBlock({
      ...this._declarationBlockConfig,
      blockTransformer: t => this.applyVariablesWrapper(t, operationType),
    })
      .export()
      .asKind('type')
      .withName(
        this.convertName(name, {
          suffix: operationTypeSuffix + 'Variables',
        })
      )
      .withBlock(visitedOperationVariables).string;

    const dependentTypesContent = this._parsedConfig.extractAllFieldsToTypes
      ? selectionSetObjects.dependentTypes.map(
          i =>
            new DeclarationBlock(this._declarationBlockConfig)
              .export()
              .asKind('type')
              .withName(i.name)
              .withContent(i.content).string
        )
      : [];

    return [
      ...(dependentTypesContent.length > 0 ? [dependentTypesContent.join('\n')] : []),
      operationVariables,
      operationResult,
    ]
      .filter(r => r)
      .join('\n\n');
  }
}

function getRootType(operation: OperationTypeNode, schema: GraphQLSchema) {
  switch (operation) {
    case 'query':
      return schema.getQueryType();
    case 'mutation':
      return schema.getMutationType();
    case 'subscription':
      return schema.getSubscriptionType();
  }
  throw new Error(`Unknown operation type: ${operation}`);
}
