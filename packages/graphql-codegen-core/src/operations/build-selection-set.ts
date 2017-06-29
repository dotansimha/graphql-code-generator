import { SelectionSetFieldNode } from '../types';
import { FieldNode, GraphQLSchema, GraphQLType, SelectionNode, SelectionSetNode } from 'graphql';
import { FIELD, FRAGMENT_SPREAD, INLINE_FRAGMENT } from 'graphql/language/kinds';
import { getFieldDef } from '../utils/get-field-def';
import { resolveType } from '../schema/resolve-type';

export function buildSelectionSet(schema: GraphQLSchema, rootObject: GraphQLType, node: SelectionSetNode): SelectionSetFieldNode[] {
  return (node.selections || []).map((selectionNode: SelectionNode): SelectionSetFieldNode => {
    if (selectionNode.kind === FIELD) {
      const fieldNode = selectionNode as FieldNode;
      const field = getFieldDef(rootObject, selectionNode);
      const resolvedType = resolveType(field.type);

      return {
        name: fieldNode.alias && fieldNode.alias.value ? fieldNode.alias.value : fieldNode.name.value,
        selectionSet: buildSelectionSet(schema, rootObject, fieldNode.selectionSet || []),
        arguments: [],
        type: resolvedType.name,
        isRequired: resolvedType.isRequired,
        isArray: resolvedType.isArray,
      };
    } else if (selectionNode.kind === FRAGMENT_SPREAD) {

    } else if (selectionNode.kind === INLINE_FRAGMENT) {

    } else {
      // TODO: Throw
    }
  });
}
