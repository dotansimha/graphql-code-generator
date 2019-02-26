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
  isEnumType,
  GraphQLSchema
} from 'graphql';
import { getBaseType, quoteIfNeeded } from './utils';
import { ScalarsMap, ConvertNameFn } from './types';
import { GraphQLObjectType, GraphQLNonNull, GraphQLList, isNonNullType, isListType } from 'graphql';

export type PrimitiveField = string;
export type PrimitiveAliasedFields = { alias: string; fieldName: string };
export type LinkField = { alias: string; name: string; type: string; selectionSet: string };
export type FragmentSpreadField = string;
export type InlineFragmentField = { [onType: string]: string[] };

export interface ISelectionSetToObjectClass {
  new (
    _scalars: ScalarsMap,
    _schema: GraphQLSchema,
    _convertName: ConvertNameFn,
    _addTypename: boolean,
    _parentSchemaType: GraphQLNamedType,
    _selectionSet: SelectionSetNode
  ): SelectionSetToObject;
}

export class SelectionSetToObject {
  protected _primitiveFields: PrimitiveField[] = [];
  protected _primitiveAliasedFields: PrimitiveAliasedFields[] = [];
  protected _linksFields: LinkField[] = [];
  protected _fragmentSpreads: FragmentSpreadField[] = [];
  protected _inlineFragments: InlineFragmentField = {};
  protected _queriedForTypename = false;

  constructor(
    protected _scalars: ScalarsMap,
    protected _schema: GraphQLSchema,
    protected _convertName: ConvertNameFn,
    protected _addTypename: boolean,
    protected _parentSchemaType: GraphQLNamedType,
    protected _selectionSet: SelectionSetNode
  ) {}

  protected getClassCreator(): ISelectionSetToObjectClass {
    throw new Error(`You must override getClassCreator in your SelectionSetToObject implementation!`);
  }

  protected wrapTypeWithModifiers(
    baseType: string,
    type: GraphQLObjectType | GraphQLNonNull<GraphQLObjectType> | GraphQLList<GraphQLObjectType>
  ): string {
    throw new Error(`You must override wrapTypeWithModifiers in your SelectionSetToObject implementation!`);
  }

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

      if (this._scalars[typeName] || isEnumType(baseType)) {
        if (field.alias && field.alias.value) {
          this._primitiveAliasedFields.push({
            fieldName: field.name.value,
            alias: field.alias.value
          });
        } else {
          this._primitiveFields.push(field.name.value);
        }
      } else {
        const selectionSetToObject = new (this.getClassCreator())(
          this._scalars,
          this._schema,
          this._convertName,
          this._addTypename,
          baseType,
          field.selectionSet
        );

        this._linksFields.push({
          alias: field.alias ? field.alias.value : null,
          name: field.name.value,
          type: typeName,
          selectionSet: this.wrapTypeWithModifiers(selectionSetToObject.string, rawType)
        });
      }
    }
  }

  _collectFragmentSpread(node: FragmentSpreadNode) {
    this._fragmentSpreads.push(node.name.value);
  }

  _collectInlineFragment(node: InlineFragmentNode) {
    const onType = node.typeCondition.name.value;
    const schemaType = this._schema.getType(onType);
    const selectionSet = new (this.getClassCreator())(
      this._scalars,
      this._schema,
      this._convertName,
      this._addTypename,
      schemaType,
      node.selectionSet
    );

    if (!this._inlineFragments[onType]) {
      this._inlineFragments[onType] = [];
    }

    this._inlineFragments[onType].push(selectionSet.string);
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

    const parentName = this._convertName(this._parentSchemaType.name, true);
    const typeName = this._addTypename || this._queriedForTypename ? this.buildTypeNameField() : null;
    const baseFields = this.buildPrimitiveFields(parentName, this._primitiveFields);
    const aliasBaseFields = this.buildAliasedPrimitiveFields(parentName, this._primitiveAliasedFields);
    const linksFields = this.buildLinkFields(this._linksFields);
    const inlineFragments = this.buildInlineFragments(this._inlineFragments);
    const fragmentSpreads = this.buildFragmentSpread(this._fragmentSpreads);
    const fieldsSet = [typeName, baseFields, aliasBaseFields, linksFields, fragmentSpreads, inlineFragments].filter(
      f => f && f !== ''
    );

    return this.mergeAllFields(fieldsSet);
  }

  protected mergeAllFields(fieldsSet: Array<string | null>): string {
    return quoteIfNeeded(fieldsSet, ' & ');
  }

  protected buildTypeNameField(): string | null {
    const possibleTypes = [];

    if (!isUnionType(this._parentSchemaType) && !isInterfaceType(this._parentSchemaType)) {
      possibleTypes.push(this._parentSchemaType.name);
    }

    if (possibleTypes.length === 0) {
      return null;
    }

    return `{ __typename${this._queriedForTypename ? '' : '?'}: ${possibleTypes.map(t => `'${t}'`).join(' | ')} }`;
  }

  protected buildPrimitiveFields(parentName: string, fields: PrimitiveField[]): string | null {
    if (fields.length === 0) {
      return null;
    }

    return `Pick<${parentName}, ${fields.map(field => `'${field}'`).join(' | ')} }>`;
  }

  protected buildAliasedPrimitiveFields(parentName: string, fields: PrimitiveAliasedFields[]): string | null {
    if (fields.length === 0) {
      return null;
    }

    return `{ ${fields
      .map(aliasedField => `${aliasedField.alias}: ${parentName}['${aliasedField.fieldName}']`)
      .join(', ')} }`;
  }

  protected buildLinkFields(fields: LinkField[]): string | null {
    if (fields.length === 0) {
      return null;
    }

    return `{ ${fields.map(field => `${field.alias || field.name}: ${field.selectionSet}`).join(', ')} }`;
  }

  protected buildInlineFragments(inlineFragments: InlineFragmentField): string | null {
    const allPossibleTypes = Object.keys(inlineFragments).map(typeName => inlineFragments[typeName].join(' & '));

    return allPossibleTypes.length === 0 ? null : `(${allPossibleTypes.join(' | ')})`;
  }

  protected buildFragmentSpread(fragmentsSpread: FragmentSpreadField[]): string | null {
    if (fragmentsSpread.length === 0) {
      return null;
    }

    return quoteIfNeeded(
      fragmentsSpread.map(fragmentName => this._convertName(fragmentName + 'Fragment', true)),
      ' & '
    );
  }
}
