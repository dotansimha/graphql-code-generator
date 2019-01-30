import { FragmentDefinitionNode, GraphQLSchema, typeFromAST } from 'graphql';
import { Fragment } from '../types';
import { buildSelectionSet, separateSelectionSet } from './build-selection-set';
import { debugLog } from '../debugging';
import { print } from 'graphql/language/printer';
import { getDirectives } from 'graphql-toolkit';

export function transformFragment(
  schema: GraphQLSchema,
  fragment: FragmentDefinitionNode,
  overrideName?: string | null
): Fragment {
  debugLog(
    `[transformFragment] transforming fragment ${fragment.name.value} on type ${fragment.typeCondition.name.value}`
  );

  const root = typeFromAST(schema, fragment.typeCondition);
  const name = overrideName ? overrideName : fragment.name.value;
  const onType = fragment.typeCondition.name.value;
  const directives = getDirectives(schema, fragment);
  const selectionSet = buildSelectionSet(schema, root, fragment.selectionSet);

  return {
    name,
    onType,
    selectionSet,
    document: print(fragment),
    directives,
    usesDirectives: Object.keys(directives).length > 0,
    ...separateSelectionSet(selectionSet)
  } as Fragment;
}
