import {
  SelectionSetNode,
  Kind,
  FieldNode,
  FragmentSpreadNode,
  InlineFragmentNode,
  GraphQLNamedType,
  isObjectType,
  isUnionType,
  isInterfaceType,
  isEnumType
} from 'graphql';
import { getBaseType, quoteIfNeeded } from './utils';
import { FlowDocumentsVisitor } from './visitor';
import { wrapTypeWithModifiers } from 'graphql-codegen-flow';

export class SelectionSetToObject {
  private _primitiveFields: string[] = [];
  private _primitiveAliasedFields: { alias: string; fieldName: string }[] = [];
  private _linksFields: { alias: string; name: string; type: string; selectionSet: string }[] = [];
  private _fragmentSpreads: string[] = [];
  private _inlineFragments: { [onType: string]: string[] } = {};
  private _queriedForTypename = false;

  constructor(
    private _visitorInstance: FlowDocumentsVisitor,
    private _parentSchemaType: GraphQLNamedType,
    private _selectionSet: SelectionSetNode
  ) {}

  _collectField(field: FieldNode) {
    if (field.name.value === '__typename') {
      this._queriedForTypename = true;

      return;
    }

    if (isObjectType(this._parentSchemaType) || isInterfaceType(this._parentSchemaType)) {
      const schemaField = this._parentSchemaType.getFields()[field.name.value];
      const rawType = schemaField.type as any;
      const baseType = getBaseType(rawType);
      const typeName = baseType.name;

      if (this._visitorInstance.scalars[typeName] || isEnumType(baseType)) {
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
          selectionSet: wrapTypeWithModifiers(selectionSetToObject.string, rawType)
        });
      }
    }
  }

  _collectFragmentSpread(node: FragmentSpreadNode) {
    this._fragmentSpreads.push(node.name.value);
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

  private _buildTypeNameField(): string | null {
    const possibleTypes = [];

    if (!isUnionType(this._parentSchemaType) && !isInterfaceType(this._parentSchemaType)) {
      possibleTypes.push(this._parentSchemaType.name);
    }

    if (possibleTypes.length === 0) {
      return null;
    }

    return `{ __typename${this._queriedForTypename ? '' : '?'}: ${possibleTypes.map(t => `'${t}'`).join(' | ')} }`;
  }

  get string(): string {
    if (!this._selectionSet || !this._selectionSet.selections || this._selectionSet.selections.length === 0) {
      return '';
    }

    const { selections } = this._selectionSet;
    const useFlowExactObject: boolean = this._visitorInstance.parsedConfig.useFlowExactObjects;
    const useFlowReadOnlyTypes: boolean = this._visitorInstance.parsedConfig.useFlowReadOnlyTypes;

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

    const typeName = this._visitorInstance.addTypename || this._queriedForTypename ? this._buildTypeNameField() : null;
    const baseFields = this._primitiveFields.length
      ? `$Pick<${this._visitorInstance.convertName(this._parentSchemaType.name)}, {${
          useFlowExactObject ? '|' : ''
        } ${this._primitiveFields.map(fieldName => `${useFlowReadOnlyTypes ? '+' : ''}${fieldName}: *`).join(', ')} ${
          useFlowExactObject ? '|' : ''
        }}>`
      : null;
    const linksFields = this._linksFields.length
      ? `{${useFlowExactObject ? '|' : ''} ${this._linksFields
          .map(field => `${useFlowReadOnlyTypes ? '+' : ''}${field.alias || field.name}: ${field.selectionSet}`)
          .join(', ')} ${useFlowExactObject ? '|' : ''}}`
      : null;
    const aliasBaseFields = this._primitiveAliasedFields.length
      ? `{${useFlowExactObject ? '|' : ''} ${this._primitiveAliasedFields
          .map(
            aliasedField =>
              `${useFlowReadOnlyTypes ? '+' : ''}${
                aliasedField.alias
              }: $ElementType<${this._visitorInstance.convertName(this._parentSchemaType.name)}, '${
                aliasedField.fieldName
              }'>`
          )
          .join(', ')} ${useFlowExactObject ? '|' : ''}}`
      : null;
    const inlineFragments = this.inlineFragmentsString;
    const fragmentSpreads = quoteIfNeeded(
      this._fragmentSpreads.map(fragmentName => this._visitorInstance.getFragmentName(fragmentName)),
      ' & '
    );
    const fieldsSet = [typeName, baseFields, aliasBaseFields, linksFields, fragmentSpreads, inlineFragments].filter(
      f => f && f !== ''
    );

    return quoteIfNeeded(fieldsSet, ' & ');
  }
}
