import {
  isFragmentSpreadNode,
  SelectionSetFieldNode, SelectionSetFragmentSpread, SelectionSetInlineFragment,
  SelectionSetItem, isInlineFragmentNode
} from '../types';
import {
  FieldNode, FragmentSpreadNode, getNamedType, GraphQLSchema, GraphQLType, InlineFragmentNode, SelectionNode,
  SelectionSetNode, typeFromAST
} from 'graphql';
import { FIELD, FRAGMENT_SPREAD, INLINE_FRAGMENT } from 'graphql/language/kinds';
import { getFieldDef } from '../utils/get-field-def';
import { resolveType } from '../schema/resolve-type';

export function buildSelectionSet(schema: GraphQLSchema, rootObject: GraphQLType, node: SelectionSetNode): SelectionSetItem[] {
  return ((node && node.selections ? node.selections : []) as SelectionNode[]).map<SelectionSetItem>((selectionNode: SelectionNode): SelectionSetItem => {
    if (selectionNode.kind === FIELD) {
      const fieldNode = selectionNode as FieldNode;
      const field = getFieldDef(rootObject, fieldNode);
      const resolvedType = resolveType(field.type);
      const childSelectionSet = buildSelectionSet(schema, getNamedType(field.type), fieldNode.selectionSet);
      const fragmentsSpread = childSelectionSet.filter(n => isFragmentSpreadNode(n)).map<string>((fs: SelectionSetFragmentSpread) => fs.fragmentName);
      const inlineFragments = childSelectionSet.filter(n => isInlineFragmentNode(n)).map<SelectionSetInlineFragment>((fs: SelectionSetInlineFragment) => fs);

      return {
        isField: true,
        isFragmentSpread: false,
        isInlineFragment: false,
        isLeaf: childSelectionSet.length === 0,
        name: fieldNode.alias && fieldNode.alias.value ? fieldNode.alias.value : fieldNode.name.value,
        selectionSet: childSelectionSet,
        fragmentsSpread: fragmentsSpread,
        inlineFragments: inlineFragments,
        hasFragmentsSpread: fragmentsSpread.length > 0,
        hasInlineFragments: inlineFragments.length > 0,
        type: resolvedType.name,
        isRequired: resolvedType.isRequired,
        isArray: resolvedType.isArray,
      } as SelectionSetFieldNode;
    } else if (selectionNode.kind === FRAGMENT_SPREAD) {
      const fieldNode = selectionNode as FragmentSpreadNode;

      return {
        isField: false,
        isFragmentSpread: true,
        isInlineFragment: false,
        isLeaf: true,
        fragmentName: fieldNode.name.value,
      } as SelectionSetFragmentSpread;
    } else if (selectionNode.kind === INLINE_FRAGMENT) {
      const fieldNode = selectionNode as InlineFragmentNode;
      const nextRoot = typeFromAST(schema, fieldNode.typeCondition);
      const childSelectionSet = buildSelectionSet(schema, nextRoot, fieldNode.selectionSet);
      const fragmentsSpread = childSelectionSet.filter(n => isFragmentSpreadNode(n)).map<string>((fs: SelectionSetFragmentSpread) => fs.fragmentName);
      const inlineFragments = childSelectionSet.filter(n => isInlineFragmentNode(n)).map<SelectionSetInlineFragment>((fs: SelectionSetInlineFragment) => fs);

      return {
        isField: false,
        isFragmentSpread: false,
        isInlineFragment: true,
        isLeaf: childSelectionSet.length === 0,
        selectionSet: childSelectionSet,
        fragmentsSpread: fragmentsSpread,
        inlineFragments: inlineFragments,
        hasFragmentsSpread: fragmentsSpread.length > 0,
        hasInlineFragments: inlineFragments.length > 0,
        onType: fieldNode.typeCondition.name.value,
      } as SelectionSetInlineFragment;
    } else {
      throw new Error(`Unexpected GraphQL type: ${(selectionNode as any).kind}!`);
    }
  });
}
