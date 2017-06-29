import { FragmentDefinitionNode, GraphQLSchema, typeFromAST } from 'graphql';
import { Fragment } from '../types';
import { buildSelectionSet } from './build-selection-set';

export function transformFragment(schema: GraphQLSchema, fragment: FragmentDefinitionNode): Fragment {
  const root = typeFromAST(schema, fragment.typeCondition);
  const name = fragment.name.value;
  const onType = fragment.typeCondition.name.value;

  return {
    name,
    onType,
    selectionSet: buildSelectionSet(schema, root, fragment.selectionSet),
  } as Fragment;
}
