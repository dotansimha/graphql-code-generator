import {
  SelectionSetNode,
  GraphQLSchema,
  Kind,
  FieldNode,
  GraphQLObjectType,
  GraphQLNonNull,
  GraphQLList,
  isScalarType,
  isUnionType,
  isEnumType
} from 'graphql';
import { ScalarsMap } from 'graphql-codegen-flow';
import { getBaseType, GraphQLBaseType } from './utils';

export class SelectionSetToObject {
  private _primitiveFields: string[] = [];
  private _primitiveAliasedFields: { alias: string; fieldName: string }[] = [];
  private _linksFields: { alias: string; name: string; type: string; selectionSet: string; rawType: any }[] = [];

  constructor(
    private _scalarsMap: ScalarsMap,
    private _schema: GraphQLSchema,
    private _parentSchemaType: GraphQLBaseType,
    private _selectionSet: SelectionSetNode
  ) {}

  _collectField(field: FieldNode) {
    if (isUnionType(this._parentSchemaType)) {
    } else if (isScalarType(this._parentSchemaType)) {
    } else if (isEnumType(this._parentSchemaType)) {
    } else {
      const schemaField = this._parentSchemaType.getFields()[field.name.value];
      const baseType = getBaseType(schemaField.type);
      const typeName = baseType.name;

      if (this._scalarsMap[typeName]) {
        if (field.alias && field.alias.value) {
          this._primitiveAliasedFields.push({
            fieldName: field.name.value,
            alias: field.alias.value
          });
        } else {
          this._primitiveFields.push(field.name.value);
        }
      } else {
        const selectionSetToObject = new SelectionSetToObject(
          this._scalarsMap,
          this._schema,
          baseType,
          field.selectionSet
        );

        this._linksFields.push({
          alias: field.alias ? field.alias.value : null,
          name: field.name.value,
          type: typeName,
          selectionSet: selectionSetToObject.string,
          rawType: baseType
        });
      }
    }
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
    const fieldsSet = [baseFields, aliasBaseFields, linksFields].filter(f => f);

    return `(${fieldsSet.join(' & ')})`;
  }
}
