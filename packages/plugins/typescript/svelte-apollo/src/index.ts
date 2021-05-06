import { concatAST, DefinitionNode, DocumentNode, FragmentDefinitionNode, Kind, visit } from 'graphql';
import type { LoadedFragment } from '@graphql-codegen/visitor-plugin-common';
import type { PluginFunction, Types } from '@graphql-codegen/plugin-helpers';
import { SvelteApolloVisitor } from './visitor';
import { SvelteApolloVisitorConfig } from './config';

const isString = (item: unknown): item is string => typeof item === 'string';

const isFragmentDefinition = (node: DefinitionNode): node is FragmentDefinitionNode =>
  node.kind === Kind.FRAGMENT_DEFINITION;

const mapLoadedFragments = (allAst: DocumentNode, externalFragments: LoadedFragment[]): LoadedFragment[] => [
  ...allAst.definitions.filter(isFragmentDefinition).map(fragmentDef => ({
    node: fragmentDef,
    name: fragmentDef.name.value,
    onType: fragmentDef.typeCondition.name.value,
    isExternal: false,
  })),
  ...(externalFragments || []),
];

export const plugin: PluginFunction<SvelteApolloVisitorConfig, Types.ComplexPluginOutput> = (
  schema,
  documents,
  config
) => {
  const allAst = concatAST(documents.map(v => v.document));
  const visitor = new SvelteApolloVisitor(
    schema,
    mapLoadedFragments(allAst, config.externalFragments),
    config,
    documents as any
  );
  const visitorResult = visit(allAst, { leave: visitor });

  const imports = visitor.getImports();
  const executions = visitor.getExecutions();
  const fragments = visitor.fragments;
  const definitions = visitorResult.definitions.filter(isString).join('\n');

  return {
    prepend: imports,
    content: [executions, fragments, definitions].join('\n\n').trim(),
  };
};
