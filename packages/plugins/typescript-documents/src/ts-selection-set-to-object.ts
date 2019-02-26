import { SelectionSetToObject, ConvertNameFn, ScalarsMap } from 'graphql-codegen-visitor-plugin-common';
import {
  GraphQLSchema,
  GraphQLNamedType,
  SelectionSetNode,
  GraphQLObjectType,
  GraphQLNonNull,
  GraphQLList,
  isNonNullType,
  isListType
} from 'graphql';

export class TypeScriptSelectionSetToObject extends SelectionSetToObject {
  constructor(
    _scalars: ScalarsMap,
    _schema: GraphQLSchema,
    _convertName: ConvertNameFn,
    _addTypename: boolean,
    _parentSchemaType?: GraphQLNamedType,
    _selectionSet?: SelectionSetNode
  ) {
    super(_scalars, _schema, _convertName, _addTypename, _parentSchemaType, _selectionSet);
  }

  public createNext(parentSchemaType: GraphQLNamedType, selectionSet: SelectionSetNode): SelectionSetToObject {
    return new TypeScriptSelectionSetToObject(
      this._scalars,
      this._schema,
      this._convertName,
      this._addTypename,
      parentSchemaType,
      selectionSet
    );
  }

  private clearOptional(str: string): string {
    if (str.startsWith('Maybe')) {
      return str.replace(/^Maybe<(.*?)>$/i, '$1');
    }

    return str;
  }

  protected wrapTypeWithModifiers(
    baseType: string,
    type: GraphQLObjectType | GraphQLNonNull<GraphQLObjectType> | GraphQLList<GraphQLObjectType>
  ): string {
    if (isNonNullType(type)) {
      return this.clearOptional(this.wrapTypeWithModifiers(baseType, type.ofType));
    } else if (isListType(type)) {
      const innerType = this.wrapTypeWithModifiers(baseType, type.ofType);

      return `Maybe<Array<${innerType}>>`;
    } else {
      return `Maybe<${baseType}>`;
    }
  }
}
