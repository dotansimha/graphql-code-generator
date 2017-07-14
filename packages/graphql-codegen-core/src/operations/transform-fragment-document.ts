import { FragmentDefinitionNode, GraphQLSchema, typeFromAST } from 'graphql';
import { Fragment } from '../types';
import { buildSelectionSet } from './build-selection-set';
import { debugLog } from '../debugging';
import { print } from 'graphql/language/printer';

export function transformFragment(schema: GraphQLSchema, fragment: FragmentDefinitionNode): Fragment {
  debugLog(`[transformFragment] transforming fragment ${fragment.name.value} on type ${fragment.typeCondition.name.value}`);

  const root = typeFromAST(schema, fragment.typeCondition);
  const name = fragment.name.value;
  const onType = fragment.typeCondition.name.value;

  return {
    name,
    onType,
    selectionSet: buildSelectionSet(schema, root, fragment.selectionSet),
    document: print(fragment),
  };
}
