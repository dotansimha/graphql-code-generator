import { PluginFunction, Types } from '@graphql-codegen/plugin-helpers';
import { GraphQLSchema, concatAST, visit, Kind, FragmentDefinitionNode } from 'graphql';
import { RawConfig, LoadedFragment } from '@graphql-codegen/visitor-plugin-common';
import { InputTypeVisitor } from './input-type-visitor';
import { BaseJavaVisitor } from './base-java-visitor';
import { OperationVisitor } from './operation-visitor';
import { FileType } from './file-type';
import { CustomTypeClassVisitor } from './custom-type-class';

export interface JavaApolloAndroidPluginConfig extends RawConfig {
  /**
   * @name package
   * @type string
   * @description Customize the Java package name for the generated operations. The default package name will be generated according to the output file path.
   *
   * @example
   * ```yml
   * generates:
   * ./app/src/main/java/:
   *   preset: java-apollo-android
   *   config:
   *     package: "com.my.paackage.generated.graphql"
   *   plugins:
   *     - java-apollo-android
   * ```
   */
  package?: string;
  /**
   * @name typePackage
   * @type string
   * @description Customize the Java package name for the types generated based on input types.
   *
   * @example
   * ```yml
   * generates:
   * ./app/src/main/java/:
   *   preset: java-apollo-android
   *   config:
   *     typePackage: "com.my.paackage.generated.graphql"
   *   plugins:
   *     - java-apollo-android
   * ```
   */
  typePackage?: string;
  /**
   * @name fragmentPackage
   * @type string
   * @description Customize the Java package name for the fragments generated classes.
   *
   * @example
   * ```yml
   * generates:
   * ./app/src/main/java/:
   *   preset: java-apollo-android
   *   config:
   *     fragmentPackage: "com.my.paackage.generated.graphql"
   *   plugins:
   *     - java-apollo-android
   * ```
   */
  fragmentPackage?: string;

  // This is an internal configuration, that allow the preset to comunicate with the plugin.
  fileType: FileType;
}

export const plugin: PluginFunction<JavaApolloAndroidPluginConfig> = (
  schema: GraphQLSchema,
  documents: Types.DocumentFile[],
  config: JavaApolloAndroidPluginConfig
): Types.PluginOutput => {
  const allAst = concatAST(documents.map(v => v.document));
  const allFragments: LoadedFragment[] = [
    ...(allAst.definitions.filter(d => d.kind === Kind.FRAGMENT_DEFINITION) as FragmentDefinitionNode[]).map(
      fragmentDef => ({
        node: fragmentDef,
        name: fragmentDef.name.value,
        onType: fragmentDef.typeCondition.name.value,
        isExternal: false,
      })
    ),
    ...(config.externalFragments || []),
  ];
  let visitor: BaseJavaVisitor;

  switch (config.fileType) {
    case FileType.FRAGMENT:
    case FileType.OPERATION: {
      visitor = new OperationVisitor(schema, config, allFragments);
      break;
    }
    case FileType.INPUT_TYPE: {
      visitor = new InputTypeVisitor(schema, config);
      break;
    }
    case FileType.CUSTOM_TYPES: {
      visitor = new CustomTypeClassVisitor(schema, config);
      break;
    }
  }

  if (!visitor) {
    return '';
  }

  const visitResult = visit(allAst, visitor as any);
  const additionalContent = visitor.additionalContent();
  const imports = visitor.getImports();

  return {
    prepend: [`package ${visitor.getPackage()};\n`, ...imports],
    content: '\n' + [...visitResult.definitions.filter(a => a && typeof a === 'string'), additionalContent].join('\n'),
  };
};
