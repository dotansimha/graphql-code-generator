import {
  SelectionSetNode,
  Kind,
  FieldNode,
  isScalarType,
  isUnionType,
  isEnumType,
  FragmentSpreadNode,
  InlineFragmentNode,
  GraphQLNamedType,
  isInputObjectType
} from 'graphql';
import { getBaseType } from './utils';
import { FlowDocumentsVisitor } from './visitor';

export class SelectionSetToObject {
  private _primitiveFields: string[] = [];
  private _primitiveAliasedFields: { alias: string; fieldName: string }[] = [];
  private _linksFields: { alias: string; name: string; type: string; selectionSet: string }[] = [];
  private _fragmentSpreads: string[] = [];
  private _inlineFragments: { [onType: string]: string[] } = {};

  constructor(
    private _visitorInstance: FlowDocumentsVisitor,
    private _parentSchemaType: GraphQLNamedType,
    private _selectionSet: SelectionSetNode
  ) {}

  _collectField(field: FieldNode) {
    // TODO: Replace if
    if (isUnionType(this._parentSchemaType)) {
    } else if (isScalarType(this._parentSchemaType)) {
    } else if (isEnumType(this._parentSchemaType)) {
    } else if (isInputObjectType(this._parentSchemaType)) {
    } else {
      const schemaField = this._parentSchemaType.getFields()[field.name.value];
      const baseType = getBaseType(schemaField.type);
      const typeName = baseType.name;

      if (this._visitorInstance.scalars[typeName]) {
        if (field.alias && field.alias.value) {
          this._primitiveAliasedFields.push({
            fieldName: field.name.value,
            alias: field.alias.value
          });
        } else {
          this._primitiveFields.push(field.name.value);
        }
      } else {
        const selectionSetToObject = new SelectionSetToObject(this._visitorInstance, baseType, field.selectionSet);

        this._linksFields.push({
          alias: field.alias ? field.alias.value : null,
          name: field.name.value,
          type: typeName,
          selectionSet: selectionSetToObject.string
        });
      }
    }
  }

  _collectFragmentSpread(node: FragmentSpreadNode) {
    // TODO: implement
  }

  _collectInlineFragment(node: InlineFragmentNode) {
    const onType = node.typeCondition.name.value;
    const schemaType = this._visitorInstance.schema.getType(onType);
    const selectionSet = new SelectionSetToObject(this._visitorInstance, schemaType, node.selectionSet);

    if (!this._inlineFragments[onType]) {
      this._inlineFragments[onType] = [];
    }

    this._inlineFragments[onType].push(selectionSet.string);
  }

  get inlineFragmentsString(): string | null {
    const allPossibleTypes = Object.keys(this._inlineFragments).map(typeName =>
      this._inlineFragments[typeName].join(' & ')
    );

    return allPossibleTypes.length === 0 ? null : `(${allPossibleTypes.join(' | ')})`;
  }

  get string(): string {
    if (!this._selectionSet || !this._selectionSet.selections || this._selectionSet.selections.length === 0) {
      return '';
    }

    const { selections } = this._selectionSet;

    for (const selection of selections) {
      switch (selection.kind) {
        case Kind.FIELD:
          this._collectField(selection as FieldNode);
          break;
        case Kind.FRAGMENT_SPREAD:
          this._collectFragmentSpread(selection as FragmentSpreadNode);
          break;
        case Kind.INLINE_FRAGMENT:
          this._collectInlineFragment(selection as InlineFragmentNode);
          break;
      }
    }

    const baseFields = this._primitiveFields.length
      ? `$Pick<${this._parentSchemaType.name}, { ${this._primitiveFields
          .map(fieldName => `${fieldName}: *`)
          .join(', ')} }>`
      : null;
    const linksFields = this._linksFields.length
      ? `{ ${this._linksFields.map(field => `${field.alias || field.name}: ${field.selectionSet}`).join(', ')} }`
      : null;
    const aliasBaseFields = this._primitiveAliasedFields.length
      ? `{ ${this._primitiveAliasedFields
          .map(
            aliasedField =>
              `${aliasedField.alias}: $ElementType<${this._parentSchemaType}, '${aliasedField.fieldName}'>`
          )
          .join(', ')} }`
      : null;
    const inlineFragments = this.inlineFragmentsString;
    const fieldsSet = [baseFields, aliasBaseFields, linksFields, inlineFragments].filter(f => f);

    if (fieldsSet.length === 0) {
      return '';
    } else if (fieldsSet.length === 1) {
      return fieldsSet[0];
    } else {
      return `(${fieldsSet.join(' & ')})`;
    }
  }
}
