import {
  isFragmentSpreadNode,
  SelectionSetFieldNode,
  SelectionSetFragmentSpread,
  SelectionSetInlineFragment,
  SelectionSetItem,
  isInlineFragmentNode,
  isFieldNode
} from '../types';
import {
  Kind,
  FieldNode,
  FragmentSpreadNode,
  getNamedType,
  GraphQLSchema,
  GraphQLType,
  InlineFragmentNode,
  SelectionNode,
  SelectionSetNode,
  typeFromAST
} from 'graphql';
import { getFieldDef } from '../utils/get-field-def';
import { resolveType } from '../schema/resolve-type';
import { debugLog } from '../debugging';
import { resolveTypeIndicators } from '../schema/resolve-type-indicators';

export function separateSelectionSet(selectionSet: SelectionSetItem[]): any {
  const fields = selectionSet.filter(n => isFieldNode(n));
  const fragmentsSpread = selectionSet.filter(n => isFragmentSpreadNode(n));
  const inlineFragments = selectionSet.filter(n => isInlineFragmentNode(n));

  return {
    fragmentsSpread,
    fields,
    inlineFragments,
    hasFragmentsSpread: fragmentsSpread.length > 0,
    hasFields: fields.length > 0,
    hasInlineFragments: inlineFragments.length > 0
  };
}

export function buildSelectionSet(
  schema: GraphQLSchema,
  rootObject: GraphQLType,
  node: SelectionSetNode
): SelectionSetItem[] {
  return ((node && node.selections ? node.selections : []) as SelectionNode[])
    .map<SelectionSetItem>(
      (selectionNode: SelectionNode): SelectionSetItem => {
        if (selectionNode.kind === Kind.FIELD) {
          const fieldNode = selectionNode as FieldNode;
          const name = fieldNode.alias && fieldNode.alias.value ? fieldNode.alias.value : fieldNode.name.value;
          debugLog(`[buildSelectionSet] transforming FIELD with name ${name}`);
          const field = getFieldDef(rootObject, fieldNode);

          if (!field) {
            debugLog(`[buildSelectionSet] Ignoring field because of null result from getFieldDef...`);

            return null;
          }

          const resolvedType = resolveType(field.type);
          const childSelectionSet = buildSelectionSet(schema, getNamedType(field.type), fieldNode.selectionSet);
          const namedType = getNamedType(field.type);
          const indicators = resolveTypeIndicators(namedType);

          return {
            isField: true,
            isFragmentSpread: false,
            isInlineFragment: false,
            isLeaf: childSelectionSet.length === 0,
            name,
            selectionSet: childSelectionSet,
            ...separateSelectionSet(childSelectionSet),
            type: resolvedType.name,
            raw: resolvedType.raw,
            isRequired: resolvedType.isRequired,
            isNullableArray: resolvedType.isNullableArray,
            isArray: resolvedType.isArray,
            dimensionOfArray: resolvedType.dimensionOfArray,
            isEnum: indicators.isEnum,
            isScalar: indicators.isScalar,
            isInterface: indicators.isInterface,
            isUnion: indicators.isUnion,
            isInputType: indicators.isInputType,
            isType: indicators.isType
          } as SelectionSetFieldNode;
        } else if (selectionNode.kind === Kind.FRAGMENT_SPREAD) {
          const fieldNode = selectionNode as FragmentSpreadNode;
          debugLog(`[buildSelectionSet] transforming FRAGMENT_SPREAD with name ${fieldNode.name.value}...`);

          return {
            isField: false,
            isFragmentSpread: true,
            isInlineFragment: false,
            isLeaf: true,
            fragmentName: fieldNode.name.value
          } as SelectionSetFragmentSpread;
        } else if (selectionNode.kind === Kind.INLINE_FRAGMENT) {
          debugLog(`[buildSelectionSet] transforming INLINE_FRAGMENT...`);

          const fieldNode = selectionNode as InlineFragmentNode;
          const nextRoot = typeFromAST(schema, fieldNode.typeCondition);
          const childSelectionSet = buildSelectionSet(schema, nextRoot, fieldNode.selectionSet);

          return {
            isField: false,
            isFragmentSpread: false,
            isInlineFragment: true,
            isLeaf: childSelectionSet.length === 0,
            selectionSet: childSelectionSet,
            ...separateSelectionSet(childSelectionSet),
            onType: fieldNode.typeCondition.name.value
          } as SelectionSetInlineFragment;
        } else {
          throw new Error(`Unexpected GraphQL type: ${(selectionNode as any).kind}!`);
        }
      }
    )
    .filter(item => item); // filter to remove null types
}
