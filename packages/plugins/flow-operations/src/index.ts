import { PluginFunction, DocumentFile } from 'graphql-codegen-plugin-helpers';
import { visit, concatAST, GraphQLSchema } from 'graphql';
import { FlowDocumentsVisitor } from './visitor';
import { RawDocumentsConfig } from 'graphql-codegen-visitor-plugin-common';

export interface FlowDocumentsPluginConfig extends RawDocumentsConfig {
  useFlowExactObjects?: boolean;
  useFlowReadOnlyTypes?: boolean;
}

export const plugin: PluginFunction<FlowDocumentsPluginConfig> = (
  schema: GraphQLSchema,
  documents: DocumentFile[],
  config: FlowDocumentsPluginConfig
) => {
  let prefix = `type $Pick<Origin: Object, Keys: Object> = $ObjMapi<Keys, <Key>(k: Key) => $ElementType<Origin, Key>>;\n`;

  const allAst = concatAST(
    documents.reduce((prev, v) => {
      return [...prev, v.content];
    }, [])
  );

  const visitorResult = visit(allAst, {
    leave: new FlowDocumentsVisitor(schema, config)
  });

  return [prefix, ...visitorResult.definitions].join('\n');
};
