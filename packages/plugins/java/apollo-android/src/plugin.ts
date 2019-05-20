import { PluginFunction, Types } from '@graphql-codegen/plugin-helpers';
import { GraphQLSchema, concatAST, visit } from 'graphql';
import { RawConfig } from '@graphql-codegen/visitor-plugin-common';
import { JavaApolloAndroidVisitor } from './visitor';

export interface JavaApolloAndroidPluginConfig extends RawConfig {
  package?: string;
}

export const plugin: PluginFunction<JavaApolloAndroidPluginConfig> = (schema: GraphQLSchema, asts: Types.DocumentFile[], config: JavaApolloAndroidPluginConfig): Types.ComplexPluginOutput => {
  const visitor = new JavaApolloAndroidVisitor(schema, config);
  const allAst = concatAST(asts.reduce((prev, v) => [...prev, v.content], []));
  const visitResult = visit(allAst, visitor);

  return {
    prepend: [`package ${visitor.config.package};\n`, ...visitor.imports],
    content: '\n' + visitResult.definitions.filter(a => a && typeof a === 'string').join('\n'),
  };
};
