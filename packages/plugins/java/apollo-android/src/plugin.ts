import { PluginFunction, Types } from '@graphql-codegen/plugin-helpers';
import { GraphQLSchema, concatAST, visit, Kind } from 'graphql';
import { RawConfig } from '@graphql-codegen/visitor-plugin-common';
import { InputTypeVisitor } from './input-type-visitor';
import { BaseJavaVisitor } from './base-java-visitor';
import { OperationVisitor } from './operation-visitor';

export interface JavaApolloAndroidPluginConfig extends RawConfig {
  package?: string;
  typePackage?: string;
}

export const plugin: PluginFunction<JavaApolloAndroidPluginConfig> = (schema: GraphQLSchema, asts: Types.DocumentFile[], config: JavaApolloAndroidPluginConfig): Types.ComplexPluginOutput => {
  const visitor: BaseJavaVisitor = asts[0].content.definitions[0].kind === Kind.INPUT_OBJECT_TYPE_DEFINITION ? new InputTypeVisitor(schema, config) : new OperationVisitor(schema, config);
  const allAst = concatAST(asts.reduce((prev, v) => [...prev, v.content], []));
  const visitResult = visit(allAst, visitor as any);

  return {
    prepend: [`package ${visitor.config.package};\n`, ...visitor.getImports()],
    content: '\n' + visitResult.definitions.filter(a => a && typeof a === 'string').join('\n'),
  };
};
