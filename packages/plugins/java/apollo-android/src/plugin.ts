import { PluginFunction, Types } from '@graphql-codegen/plugin-helpers';
import { GraphQLSchema, concatAST, visit, Kind, FragmentDefinitionNode } from 'graphql';
import { RawConfig, LoadedFragment } from '@graphql-codegen/visitor-plugin-common';
import { InputTypeVisitor } from './input-type-visitor';
import { BaseJavaVisitor } from './base-java-visitor';
import { OperationVisitor } from './operation-visitor';
import { FileType } from './file-type';

export interface JavaApolloAndroidPluginConfig extends RawConfig {
  package?: string;
  typePackage?: string;
  fragmentPackage?: string;
  fileType: FileType;
}

export const plugin: PluginFunction<JavaApolloAndroidPluginConfig> = (schema: GraphQLSchema, asts: Types.DocumentFile[], config: JavaApolloAndroidPluginConfig): Types.PluginOutput => {
  const allAst = concatAST(asts.reduce((prev, v) => [...prev, v.content], []));
  const allFragments: LoadedFragment[] = [
    ...(allAst.definitions.filter(d => d.kind === Kind.FRAGMENT_DEFINITION) as FragmentDefinitionNode[]).map(fragmentDef => ({ node: fragmentDef, name: fragmentDef.name.value, onType: fragmentDef.typeCondition.name.value, isExternal: false })),
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
      // TODO: this
      break;
    }
  }

  if (!visitor) {
    return '';
  }

  const visitResult = visit(allAst, visitor as any);

  return {
    prepend: [`package ${visitor.getPackage()};\n`, ...visitor.getImports()],
    content: '\n' + visitResult.definitions.filter(a => a && typeof a === 'string').join('\n'),
  };
};
