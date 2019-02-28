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
  InlineFragmentNode,
  SelectionNode,
  SelectionSetNode,
  typeFromAST,
  isEqualType,
  GraphQLNamedType,
  GraphQLObjectType,
  __Schema,
  __Type,
  SchemaMetaFieldDef,
  TypeMetaFieldDef,
  GraphQLField
} from 'graphql';
import { getFieldDef } from '../utils/get-field-def';
import { resolveType } from '../schema/resolve-type';
import { debugLog } from '../debugging';
import { resolveTypeIndicators } from '../schema/resolve-type-indicators';

function isMetadataFieldName(name: string) {
  return ['__schema', '__type'].includes(name);
}

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

const metadataObjectMap: Record<string, GraphQLObjectType> = {
  __schema: __Schema,
  __type: __Type
};
const metadataFieldMap: Record<string, GraphQLField<any, any>> = {
  __schema: SchemaMetaFieldDef,
  __type: TypeMetaFieldDef
};

export function buildMetadata(schema: GraphQLSchema, fieldNode: FieldNode): SelectionSetItem {
  const name = fieldNode.name.value;
  const type = metadataObjectMap[name];
  const field = metadataFieldMap[name];

  return resolveFieldNode(
    schema,
    fieldNode,
    field,
    fieldNode.alias && fieldNode.alias.value ? fieldNode.alias.value : fieldNode.name.value,
    type
  );
}

function resolveFieldNode(
  schema: GraphQLSchema,
  fieldNode: FieldNode,
  field: GraphQLField<any, any>,
  name: string,
  type: GraphQLNamedType
): SelectionSetItem {
  const resolvedType = resolveType(field.type);
  const childSelectionSet = buildSelectionSet(schema, type, fieldNode.selectionSet);
  const namedType = type;
  const indicators = resolveTypeIndicators(namedType);

  return {
    isField: true,
    isFragmentSpread: false,
    isInlineFragment: false,
    isLeaf: childSelectionSet.length === 0,
    schemaFieldName: fieldNode.name.value,
    name,
    isAliased: fieldNode.alias && fieldNode.alias.value,
    selectionSet: childSelectionSet,
    ...separateSelectionSet(childSelectionSet),
    type: resolvedType.name,
    raw: resolvedType.raw,
    isRequired: resolvedType.isRequired,
    isNullableArray: resolvedType.isNullableArray,
    isArray: resolvedType.isArray,
    dimensionOfArray: resolvedType.dimensionOfArray,
    hasTypename: hasTypename(fieldNode),
    isEnum: indicators.isEnum,
    isScalar: indicators.isScalar,
    isInterface: indicators.isInterface,
    isUnion: indicators.isUnion,
    isInputType: indicators.isInputType,
    isType: indicators.isType
  } as SelectionSetFieldNode;
}

export function buildSelectionSet(
  schema: GraphQLSchema,
  rootObject: GraphQLNamedType,
  node: SelectionSetNode
): SelectionSetItem[] {
  return ((node && node.selections ? node.selections : []) as SelectionNode[])
    .map<SelectionSetItem>(
      (selectionNode: SelectionNode): SelectionSetItem => {
        if (selectionNode.kind === Kind.FIELD) {
          const fieldNode = selectionNode as FieldNode;
          const name = fieldNode.alias && fieldNode.alias.value ? fieldNode.alias.value : fieldNode.name.value;
          debugLog(`[buildSelectionSet] transforming FIELD with name ${name}`);

          if (isEqualType(schema.getQueryType(), rootObject) && isMetadataFieldName(fieldNode.name.value)) {
            return buildMetadata(schema, fieldNode);
          }

          const field = getFieldDef(rootObject, fieldNode);

          if (!field) {
            debugLog(`[buildSelectionSet] Ignoring field because of null result from getFieldDef...`);

            return null;
          }

          return resolveFieldNode(schema, fieldNode, field, name, getNamedType(field.type));
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
            onType: fieldNode.typeCondition.name.value,
            hasTypename: hasTypename(fieldNode)
          } as SelectionSetInlineFragment;
        } else {
          throw new Error(`Unexpected GraphQL type: ${(selectionNode as any).kind}!`);
        }
      }
    )
    .filter(item => item); // filter to remove null types
}

function hasTypename(fieldNode: FieldNode | InlineFragmentNode): boolean {
  return (
    fieldNode.selectionSet &&
    fieldNode.selectionSet.selections.some(f => f.kind === 'Field' && f.name.value === '__typename')
  );
}
