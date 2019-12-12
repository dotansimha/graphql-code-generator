import { isUsingTypes, Types, CodegenPlugin } from '@graphql-codegen/plugin-helpers';
import { BaseVisitor, LoadedFragment, buildScalars, getPossibleTypes } from '@graphql-codegen/visitor-plugin-common';
import addPlugin from '@graphql-codegen/add';
import { join, resolve } from 'path';
import { Kind, FragmentDefinitionNode, buildASTSchema, GraphQLSchema } from 'graphql';
import { appendExtensionToFilePath, defineFilepathSubfolder, extractExternalFragmentsInUse, resolveRelativeImport, interpolate } from './utils';

export type NearOperationFileConfig = {
  /**
   * @name baseTypesPath
   * @type string
   * @description Required, should point to the base schema types file.
   * The key of the output is used a the base path for this file.
   *
   * @example
   * ```yml
   * generates:
   * src/:
   *  preset: near-operation-file
   *  presetConfig:
   *    baseTypesPath: types.ts
   *  plugins:
   *    - typescript-operations
   * ```
   */
  baseTypesPath: string;
  /**
   * @name extension
   * @type string
   * @description Optional, sets the extension for the generated files. Use this to override the extension if you are using plugins that requires a different type of extensions (such as `typescript-react-apollo`)
   * @default .generates.ts
   *
   * @example
   * ```yml
   * generates:
   * src/:
   *  preset: near-operation-file
   *  presetConfig:
   *    baseTypesPath: types.ts
   *    extension: .generated.tsx
   *  plugins:
   *    - typescript-operations
   *    - typescript-react-apollo
   * ```
   */
  extension?: string;
  /**
   * @name cwd
   * @type string
   * @description Optional, override the `cwd` of the execution. We are using `cwd` to figure out the imports between files. Use this if your execuion path is not your project root directory.
   * @default process.cwd()
   *
   * @example
   * ```yml
   * generates:
   * src/:
   *  preset: near-operation-file
   *  presetConfig:
   *    baseTypesPath: types.ts
   *    cwd: /some/path
   *  plugins:
   *    - typescript-operations
   * ```
   */
  folder?: string;
  /**
   * @name folder
   * @type string
   * @description Optional, defines a folder, (Relative to the source files) where the generated files will be created.
   * @default ''
   *
   * @example
   * ```yml
   * generates:
   * src/:
   *  preset: near-operation-file
   *  presetConfig:
   *    baseTypesPath: types.ts
   *    folder: __generated__
   *  plugins:
   *    - typescript-operations
   * ```
   */
  cwd?: string;
  /**
   * @name importTypesNamespace
   * @type string
   * @description Optional, override the name of the import namespace used to import from the `baseTypesPath` file.
   * @default Types
   *
   * @example
   * ```yml
   * generates:
   * src/:
   *  preset: near-operation-file
   *  presetConfig:
   *    baseTypesPath: types.ts
   *    importTypesNamespace: SchemaTypes
   *  plugins:
   *    - typescript-operations
   * ```
   */
  importTypesNamespace?: string;
  /**
   * @name importTypesTemplate
   * @type string
   * @description Optional, override the template used to import from the `baseTypesPath` file.
   * templates
   * @default "import * as ${importTypesNamespace} from '${relativeImportPath}';"
   *
   * @example
   * ```yml
   * generates:
   * src/:
   *  preset: near-operation-file
   *  presetConfig:
   *    baseTypesPath: types.dart
   *    importTypesNamespace: ''
   *    importTypesTemplate: "import '${relativeImportPath}.dart'${importTypesNamespace ? ' as ' : ''}${importTypesNamespace};"
   *    # NOTE: The template can contain simple ternary (`if ? then : else` literal or variable statements,
   *    # but not nested templates or nested ternary operations
   *  plugins:
   *    - graphql-to-dart/documents
   * ```
   */
  importTypesTemplate?: string;
  /**
   * @name importFragmentsTemplate
   * @type string
   * @description Optional, override the template used to import from the `baseTypesPath` file.
   * templates
   * @default "import { ${fragmentNames} } from '${fragmentImportPath}';"
   *
   * @example
   * ```yml
   * generates:
   * src/:
   *  preset: near-operation-file
   *  presetConfig:
   *    importFragmentsTemplate: "import '${fragmentImportPath}.dart' show ${fragmentNames};"
   *    # NOTE: The template can contain simple ternary (`if ? then : else`) literal or variable statements,
   *    # but not nested templates or nested ternary operations
   *  plugins:
   *    - graphql-to-dart/documents
   * ```
   */
  importFragmentsTemplate?: string;
  /**
   * @name fragmentImportSuffix
   * @type string
   * @description Optional, override the suffix to add to fragment import types
   * @default "Fragment"
   *
   * @example
   * ```yml
   * generates:
   * src/:
   *  preset: near-operation-file
   *  presetConfig:
   *    fragmentImportSuffix: ""
   *  plugins:
   *    - graphql-to-dart/documents
   * ```
   */
  fragmentImportSuffix?: string;
};

export type FragmentNameToFile = { [fragmentName: string]: { filePath: string; importsNames: string[]; onType: string; node: FragmentDefinitionNode } };

export const preset: Types.OutputPreset<NearOperationFileConfig> = {
  buildGeneratesSection: options => {
    const schemaObject: GraphQLSchema = options.schemaAst ? options.schemaAst : buildASTSchema(options.schema);
    const baseVisitor = new BaseVisitor(options.config, {
      scalars: buildScalars(schemaObject, options.config.scalars),
    });

    const getAllFragmentSubTypes = (possbileTypes: string[], name: string, suffix: string): string[] => {
      if (possbileTypes.length === 0) {
        return [];
      } else if (possbileTypes.length === 1) {
        return [
          baseVisitor.convertName(name, {
            useTypesPrefix: true,
            suffix: suffix,
          }),
        ];
      } else {
        return possbileTypes.map(typeName =>
          baseVisitor.convertName(name, {
            useTypesPrefix: true,
            suffix: `_${typeName}_${suffix}`,
          })
        );
      }
    };

    if (!options.presetConfig.baseTypesPath) {
      throw new Error(`Preset "near-operation-file" requires you to specify "baseTypesPath" configuration and point it to your base types file (generated by "typescript" plugin)!`);
    }

    const baseDir = options.presetConfig.cwd || process.cwd();
    const extension = options.presetConfig.extension || '.generated.ts';
    const folder = options.presetConfig.folder || '';
    const importTypesNamespace = options.presetConfig.importTypesNamespace || 'Types';
    const importTypesTemplate = options.presetConfig.importTypesTemplate || "import * as ${importTypesNamespace} from '${relativeImportPath}';";
    const importFragmentsTemplate = options.presetConfig.importFragmentsTemplate || "import { ${fragmentNames} } from '${fragmentImportPath}';";
    const fragmentImportSuffix = options.presetConfig.fragmentImportSuffix || 'Fragment';

    const pluginMap: { [name: string]: CodegenPlugin } = {
      ...options.pluginMap,
      add: addPlugin,
    };

    const duplicateFragmentNames: string[] = [];
    const fragmentNameToFile: FragmentNameToFile = options.documents.reduce((prev: FragmentNameToFile, documentRecord) => {
      const fragments: FragmentDefinitionNode[] = documentRecord.content.definitions.filter(d => d.kind === Kind.FRAGMENT_DEFINITION) as FragmentDefinitionNode[];

      if (fragments.length > 0) {
        for (const fragment of fragments) {
          const schemaType = schemaObject.getType(fragment.typeCondition.name.value);

          if (!schemaType) {
            throw new Error(`Fragment "${fragment.name.value}" is set on non-existing type "${fragment.typeCondition.name.value}"!`);
          }

          const possibleTypes = getPossibleTypes(schemaObject, schemaType);
          const fragmentSuffix = options.config.dedupeOperationSuffix && fragment.name.value.toLowerCase().endsWith(fragmentImportSuffix.toLowerCase()) ? '' : fragmentImportSuffix;
          const filePath = appendExtensionToFilePath(documentRecord.filePath, extension);
          const importsNames = getAllFragmentSubTypes(
            possibleTypes.map(t => t.name),
            fragment.name.value,
            fragmentSuffix
          );

          if (prev[fragment.name.value]) {
            duplicateFragmentNames.push(fragment.name.value);
          }

          prev[fragment.name.value] = { filePath, importsNames, onType: fragment.typeCondition.name.value, node: fragment };
        }
      }

      return prev;
    }, {} as FragmentNameToFile);

    if (duplicateFragmentNames.length) {
      throw new Error(`Multiple fragments with the name(s) "${duplicateFragmentNames.join(', ')}" were found.`);
    }

    const shouldAbsolute = !options.presetConfig.baseTypesPath.startsWith('~');

    return (options.documents as Types.DocumentFile[])
      .map<Types.GenerateOptions | null>(documentFile => {
        const newFilePath = defineFilepathSubfolder(documentFile.filePath, folder);
        const generatedFilePath = appendExtensionToFilePath(newFilePath, extension);
        const absGeneratedFilePath = resolve(baseDir, generatedFilePath);
        const relativeImportPath = shouldAbsolute ? resolveRelativeImport(absGeneratedFilePath, resolve(baseDir, join(options.baseOutputDir, options.presetConfig.baseTypesPath))) : options.presetConfig.baseTypesPath.replace(`~`, '');
        const fragmentsInUse = extractExternalFragmentsInUse(documentFile.content, fragmentNameToFile);
        const plugins = [...options.plugins];

        const config = {
          ...options.config,
          // This is set here in order to make sure the fragment spreads sub types
          // are exported from operations file
          exportFragmentSpreadSubTypes: true,
          namespacedImportName: importTypesNamespace,
          externalFragments: [] as LoadedFragment<{ level: number }>[],
        };

        for (const fragmentName of Object.keys(fragmentsInUse)) {
          const level = fragmentsInUse[fragmentName];
          const fragmentDetails = fragmentNameToFile[fragmentName];

          if (fragmentDetails) {
            const fragmentGeneratedFilePath = defineFilepathSubfolder(fragmentDetails.filePath, folder);
            const absFragmentFilePath = resolve(baseDir, fragmentGeneratedFilePath);
            const fragmentImportPath = resolveRelativeImport(absGeneratedFilePath, absFragmentFilePath);

            if (!options.config.globalNamespace && level === 0) {
              const fragmentNames = fragmentDetails.importsNames.join(', ');
              plugins.unshift({
                add: interpolate(importFragmentsTemplate, { fragmentNames, fragmentImportPath }),
              });
            }

            config.externalFragments.push({
              level,
              isExternal: true,
              importFrom: fragmentImportPath,
              name: fragmentName,
              onType: fragmentDetails.onType,
              node: fragmentDetails.node,
            });
          }
        }

        if (
          isUsingTypes(
            documentFile.content,
            config.externalFragments.map(m => m.name),
            schemaObject
          )
        ) {
          plugins.unshift({ add: interpolate(importTypesTemplate, { importTypesNamespace, relativeImportPath }) });
        }

        return {
          filename: generatedFilePath,
          plugins,
          pluginMap,
          config,
          schema: options.schema,
          schemaAst: schemaObject,
          documents: [documentFile],
          skipDocumentsValidation: true,
        };
      })
      .filter(f => f);
  },
};

export default preset;
