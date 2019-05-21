import { PluginFunction, Types } from '@graphql-codegen/plugin-helpers';
import { GraphQLSchema, concatAST, visit, Kind, FragmentDefinitionNode } from 'graphql';
import { RawConfig, LoadedFragment } from '@graphql-codegen/visitor-plugin-common';
import { InputTypeVisitor } from './input-type-visitor';
import { BaseJavaVisitor } from './base-java-visitor';
import { OperationVisitor } from './operation-visitor';

export interface JavaApolloAndroidPluginConfig extends RawConfig {
  package?: string;
  typePackage?: string;
  fragmentPackage?: string;
}

export const plugin: PluginFunction<JavaApolloAndroidPluginConfig> = (schema: GraphQLSchema, asts: Types.DocumentFile[], config: JavaApolloAndroidPluginConfig): Types.ComplexPluginOutput => {
  const allAst = concatAST(asts.reduce((prev, v) => [...prev, v.content], []));
  const allFragments: LoadedFragment[] = [
    ...(allAst.definitions.filter(d => d.kind === Kind.FRAGMENT_DEFINITION) as FragmentDefinitionNode[]).map(fragmentDef => ({ node: fragmentDef, name: fragmentDef.name.value, onType: fragmentDef.typeCondition.name.value, isExternal: false })),
    ...(config.externalFragments || []),
  ];

  const visitor: BaseJavaVisitor = asts[0].content.definitions[0].kind === Kind.INPUT_OBJECT_TYPE_DEFINITION ? new InputTypeVisitor(schema, config) : new OperationVisitor(schema, config, allFragments);
  const visitResult = visit(allAst, visitor as any);

  return {
    prepend: [`package ${visitor.config.package};\n`, ...visitor.getImports()],
    content: '\n' + visitResult.definitions.filter(a => a && typeof a === 'string').join('\n'),
  };
};
