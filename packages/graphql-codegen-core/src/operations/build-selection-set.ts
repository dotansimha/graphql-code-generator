import {
  SelectionSetFieldNode, SelectionSetFragmentSpread, SelectionSetInlineFragment,
  SelectionSetItem
} from '../types';
import {
  FieldNode, FragmentSpreadNode, getNamedType, GraphQLSchema, GraphQLType, InlineFragmentNode, SelectionNode,
  SelectionSetNode, typeFromAST
} from 'graphql';
import { FIELD, FRAGMENT_SPREAD, INLINE_FRAGMENT } from 'graphql/language/kinds';
import { getFieldDef } from '../utils/get-field-def';
import { resolveType } from '../schema/resolve-type';

export function buildSelectionSet(schema: GraphQLSchema, rootObject: GraphQLType, node: SelectionSetNode): SelectionSetItem[] {
  return (node.selections || []).map<SelectionSetItem>((selectionNode: SelectionNode): SelectionSetItem => {
    if (selectionNode.kind === FIELD) {
      const fieldNode = selectionNode as FieldNode;
      const field = getFieldDef(rootObject, fieldNode);
      const resolvedType = resolveType(field.type);

      return {
        name: fieldNode.alias && fieldNode.alias.value ? fieldNode.alias.value : fieldNode.name.value,
        selectionSet: buildSelectionSet(schema, getNamedType(field.type), fieldNode.selectionSet),
        type: resolvedType.name,
        isRequired: resolvedType.isRequired,
        isArray: resolvedType.isArray,
      } as SelectionSetFieldNode;
    } else if (selectionNode.kind === FRAGMENT_SPREAD) {
      const fieldNode = selectionNode as FragmentSpreadNode;

      return {
        fragmentName: fieldNode.name.value,
      } as SelectionSetFragmentSpread;
    } else if (selectionNode.kind === INLINE_FRAGMENT) {
      const fieldNode = selectionNode as InlineFragmentNode;
      const nextRoot = typeFromAST(schema, fieldNode.typeCondition);

      return {
        selectionSet: buildSelectionSet(schema, nextRoot, fieldNode.selectionSet),
        onType: fieldNode.typeCondition.name.value,
      } as SelectionSetInlineFragment;
    } else {
      throw new Error(`Unexpected GraphQL type: ${(selectionNode as any).kind}!`);
    }
  });
}
