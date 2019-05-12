import { SelectionSetToObject, ConvertNameFn, ScalarsMap, LoadedFragment } from '@graphql-codegen/visitor-plugin-common';
import { GraphQLSchema, GraphQLNamedType, SelectionSetNode, GraphQLObjectType, GraphQLNonNull, GraphQLList, isNonNullType, isListType } from 'graphql';
import { TypeScriptDocumentsParsedConfig } from './visitor';

export class TypeScriptSelectionSetToObject extends SelectionSetToObject {
  constructor(
    _scalars: ScalarsMap,
    _schema: GraphQLSchema,
    _convertName: ConvertNameFn,
    _addTypename: boolean,
    _loadedFragments: LoadedFragment[],
    private _config: TypeScriptDocumentsParsedConfig,
    _parentSchemaType?: GraphQLNamedType,
    _selectionSet?: SelectionSetNode
  ) {
    super(_scalars, _schema, _convertName, _addTypename, _loadedFragments, _config.namespacedImportName, _parentSchemaType, _selectionSet);
  }

  public createNext(parentSchemaType: GraphQLNamedType, selectionSet: SelectionSetNode): SelectionSetToObject {
    return new TypeScriptSelectionSetToObject(this._scalars, this._schema, this._convertName, this._addTypename, this._loadedFragments, this._config, parentSchemaType, selectionSet);
  }

  private clearOptional(str: string): string {
    if (str.startsWith('Maybe')) {
      return str.replace(/^Maybe<(.*?)>$/i, '$1');
    }

    return str;
  }

  protected formatNamedField(name: string): string {
    return this._config.immutableTypes ? `readonly ${name}` : name;
  }

  protected wrapTypeWithModifiers(baseType: string, type: GraphQLObjectType | GraphQLNonNull<GraphQLObjectType> | GraphQLList<GraphQLObjectType>): string {
    if (isNonNullType(type)) {
      return this.clearOptional(this.wrapTypeWithModifiers(baseType, type.ofType));
    } else if (isListType(type)) {
      const innerType = this.wrapTypeWithModifiers(baseType, type.ofType);

      return `Maybe<${this._config.immutableTypes ? 'ReadonlyArray' : 'Array'}<${innerType}>>`;
    } else {
      return `Maybe<${baseType}>`;
    }
  }
}
