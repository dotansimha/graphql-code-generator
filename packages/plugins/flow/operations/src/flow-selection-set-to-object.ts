import { SelectionSetToObject, PrimitiveField, PrimitiveAliasedFields, LinkField, ConvertNameFn, ScalarsMap, LoadedFragment } from '@graphql-codegen/visitor-plugin-common';
import { GraphQLObjectType, GraphQLNonNull, GraphQLList, isNonNullType, isListType, GraphQLSchema, GraphQLNamedType, SelectionSetNode } from 'graphql';
import { FlowDocumentsParsedConfig } from './visitor';

export class FlowSelectionSetToObject extends SelectionSetToObject {
  constructor(
    _scalars: ScalarsMap,
    _schema: GraphQLSchema,
    _convertName: ConvertNameFn,
    _addTypename: boolean,
    _preResolveTypes: boolean,
    _nonOptionalTypename: boolean,
    _loadedFragments: LoadedFragment[],
    private _visitorConfig: FlowDocumentsParsedConfig,
    _parentSchemaType?: GraphQLNamedType,
    _selectionSet?: SelectionSetNode
  ) {
    super(_scalars, _schema, _convertName, _addTypename, _preResolveTypes, _nonOptionalTypename, _loadedFragments, _visitorConfig.namespacedImportName, _visitorConfig.dedupeOperationSuffix, _parentSchemaType, _selectionSet);
  }

  public createNext(parentSchemaType: GraphQLNamedType, selectionSet: SelectionSetNode): SelectionSetToObject {
    return new FlowSelectionSetToObject(this._scalars, this._schema, this._convertName, this._addTypename, this._preResolveTypes, this._nonOptionalTypename, this._loadedFragments, this._visitorConfig, parentSchemaType, selectionSet);
  }

  protected buildPrimitiveFields(parentName: string, fields: PrimitiveField[]): string | null {
    if (fields.length === 0) {
      return null;
    }

    const useFlowExactObject = this._visitorConfig.useFlowExactObjects;
    const useFlowReadOnlyTypes = this._visitorConfig.useFlowReadOnlyTypes;

    return `$Pick<${parentName}, {${useFlowExactObject ? '|' : ''} ${fields.map(fieldName => `${useFlowReadOnlyTypes ? '+' : ''}${fieldName}: *`).join(', ')} ${useFlowExactObject ? '|' : ''}}>`;
  }

  protected buildLinkFields(fields: LinkField[]): string | null {
    if (fields.length === 0) {
      return null;
    }

    const useFlowExactObject = this._visitorConfig.useFlowExactObjects;
    const useFlowReadOnlyTypes = this._visitorConfig.useFlowReadOnlyTypes;

    return `{${useFlowExactObject ? '|' : ''} ${fields.map(field => `${useFlowReadOnlyTypes ? '+' : ''}${field.alias || field.name}: ${field.selectionSet}`).join(', ')} ${useFlowExactObject ? '|' : ''}}`;
  }

  protected buildAliasedPrimitiveFields(parentName: string, fields: PrimitiveAliasedFields[]): string | null {
    if (fields.length === 0) {
      return null;
    }

    const useFlowExactObject = this._visitorConfig.useFlowExactObjects;
    const useFlowReadOnlyTypes = this._visitorConfig.useFlowReadOnlyTypes;

    return `{${useFlowExactObject ? '|' : ''} ${fields.map(aliasedField => `${useFlowReadOnlyTypes ? '+' : ''}${aliasedField.alias}: $ElementType<${parentName}, '${aliasedField.fieldName}'>`).join(', ')} ${useFlowExactObject ? '|' : ''}}`;
  }

  protected clearOptional(str: string): string {
    if (str.startsWith('?')) {
      return str.substring(1);
    }

    return str;
  }

  protected wrapTypeWithModifiers(baseType: string, type: GraphQLObjectType | GraphQLNonNull<GraphQLObjectType> | GraphQLList<GraphQLObjectType>): string {
    if (isNonNullType(type)) {
      return this.clearOptional(this.wrapTypeWithModifiers(baseType, type.ofType));
    } else if (isListType(type)) {
      const innerType = this.wrapTypeWithModifiers(baseType, type.ofType);

      return `?Array<${innerType}>`;
    } else {
      return `?${baseType}`;
    }
  }
}
