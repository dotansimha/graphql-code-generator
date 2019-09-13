import { ConvertNameFn, getBaseType, LinkField, LoadedFragment, NormalizedScalarsMap, PrimitiveAliasedFields, PrimitiveField, SelectionSetToObject } from '@graphql-codegen/visitor-plugin-common';
import {
  FieldNode,
  FragmentSpreadNode,
  GraphQLField,
  GraphQLList,
  GraphQLNamedType,
  GraphQLNonNull,
  GraphQLObjectType,
  GraphQLOutputType,
  GraphQLSchema,
  isListType,
  isNonNullType,
  SchemaMetaFieldDef,
  SelectionNode,
  SelectionSetNode,
  TypeMetaFieldDef,
} from 'graphql';
import { FlowDocumentsParsedConfig } from './visitor';

const getFieldNodeNameValue = (node: FieldNode): string => {
  return (node.alias || node.name).value;
};

const metadataFieldMap: Record<string, GraphQLField<any, any>> = {
  __schema: SchemaMetaFieldDef,
  __type: TypeMetaFieldDef,
};

const mergeSelectionSets = (selectionSet1: SelectionSetNode, selectionSet2: SelectionSetNode) => {
  const newSelections = [...selectionSet1.selections];

  for (const selection2 of selectionSet2.selections) {
    if (selection2.kind === 'FragmentSpread') {
      newSelections.push(selection2);
      continue;
    }

    if (selection2.kind !== 'Field') {
      throw new TypeError('Invalid state.');
    }

    const match = newSelections.find(selection1 => selection1.kind === 'Field' && getFieldNodeNameValue(selection1) === getFieldNodeNameValue(selection2));

    if (match) {
      // recursively merge all selection sets
      if (match.kind === 'Field' && match.selectionSet && selection2.selectionSet) {
        mergeSelectionSets(match.selectionSet, selection2.selectionSet);
      }
      continue;
    }

    newSelections.push(selection2);
  }

  // replace existing selections
  selectionSet1.selections = newSelections;
};

function isMetadataFieldName(name: string) {
  return ['__schema', '__type'].includes(name);
}

export class FlowSelectionSetToObject extends SelectionSetToObject {
  constructor(
    _scalars: NormalizedScalarsMap,
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
    super(
      _scalars,
      _schema,
      _convertName,
      _addTypename,
      _preResolveTypes,
      _nonOptionalTypename,
      _loadedFragments,
      _visitorConfig.namespacedImportName,
      _visitorConfig.dedupeOperationSuffix,
      _visitorConfig.enumPrefix,
      _parentSchemaType,
      _selectionSet
    );
  }

  protected buildSelectionSetString(parentSchemaType: GraphQLObjectType, selectionNodes: SelectionNode[]) {
    const primitiveFields = new Map<string, FieldNode>();
    const primitiveAliasFields = new Map<string, FieldNode>();
    const linkFieldSelectionSets = new Map<
      string,
      {
        selectedFieldType: GraphQLOutputType;
        field: FieldNode;
      }
    >();
    const fragmentSpreadSelectionSets = new Map<string, FragmentSpreadNode>();
    let requireTypename = false;

    for (const selectionNode of selectionNodes) {
      if (selectionNode.kind === 'Field') {
        if (!selectionNode.selectionSet) {
          if (selectionNode.alias) {
            primitiveAliasFields.set(selectionNode.alias.value, selectionNode);
          } else if (selectionNode.name.value === '__typename') {
            requireTypename = true;
          } else {
            primitiveFields.set(selectionNode.name.value, selectionNode);
          }
        } else {
          let selectedField: GraphQLField<any, any, any> = null;

          const fields = parentSchemaType.getFields();
          selectedField = fields[selectionNode.name.value];

          if (isMetadataFieldName(selectionNode.name.value)) {
            selectedField = metadataFieldMap[selectionNode.name.value];
          }

          if (!selectedField) {
            throw new TypeError(`Could not find field type. ${parentSchemaType}.${selectionNode.name.value}`);
          }

          const fieldName = getFieldNodeNameValue(selectionNode);
          let linkFieldNode = linkFieldSelectionSets.get(fieldName);
          if (!linkFieldNode) {
            linkFieldNode = {
              selectedFieldType: selectedField.type,
              field: selectionNode,
            };
            linkFieldSelectionSets.set(fieldName, linkFieldNode);
          } else {
            mergeSelectionSets(linkFieldNode.field.selectionSet, selectionNode.selectionSet);
          }
        }
      } else if (selectionNode.kind === 'FragmentSpread') {
        fragmentSpreadSelectionSets.set(selectionNode.name.value, selectionNode);
      }
    }

    const linkFields: LinkField[] = [];
    for (const { field, selectedFieldType } of linkFieldSelectionSets.values()) {
      const realSelectedFieldType = getBaseType(selectedFieldType as any);
      const selectionSet = this.createNext(realSelectedFieldType, field.selectionSet);

      linkFields.push({
        alias: field.alias ? field.alias.value : undefined,
        name: field.name.value,
        type: realSelectedFieldType.name,
        selectionSet: this.wrapTypeWithModifiers(selectionSet.string.split(`\n`).join(`\n  `), selectedFieldType as any),
      });
    }

    const parentName =
      (this._namespacedImportName ? `${this._namespacedImportName}.` : '') +
      this._convertName(parentSchemaType.name, {
        useTypesPrefix: true,
      });

    const typeInfoField = this.buildTypeNameField(parentSchemaType, this._nonOptionalTypename, this._addTypename, requireTypename);

    if (this._preResolveTypes) {
      const primitiveFieldsTypes = this.buildPrimitiveFieldsWithoutPick(parentSchemaType, Array.from(primitiveFields.values()).map(field => field.name.value));
      const primitiveAliasTypes = this.buildAliasedPrimitiveFieldsWithoutPick(
        parentSchemaType,
        Array.from(primitiveAliasFields.values()).map(field => ({
          alias: field.alias.value,
          fieldName: field.name.value,
        }))
      );
      const linkFieldsTypes = this.buildLinkFieldsWithoutPick(linkFields);

      return `{ ${[typeInfoField, ...primitiveFieldsTypes, ...primitiveAliasTypes, ...linkFieldsTypes]
        .filter(a => a)
        .map(b => `${b.name}: ${b.type}`)
        .join(', ')} }`;
    }

    let typeInfoString: null | string = null;
    if (typeInfoField) {
      typeInfoString = `{ ${typeInfoField.name}: ${typeInfoField.type} }`;
    }

    const primitiveFieldsString = this.buildPrimitiveFields(parentName, Array.from(primitiveFields.values()).map(field => field.name.value));
    const primitiveAliasFieldsString = this.buildAliasedPrimitiveFields(
      parentName,
      Array.from(primitiveAliasFields.values()).map(field => ({
        alias: field.alias.value,
        fieldName: field.name.value,
      }))
    );
    const linkFieldsString = this.buildLinkFields(linkFields);
    const fragmentSpreadString = this.buildFragmentSpreadString([...fragmentSpreadSelectionSets.values()]);

    const result = [typeInfoString, primitiveFieldsString, primitiveAliasFieldsString, linkFieldsString, fragmentSpreadString].filter(Boolean);

    if (result.length === 0) {
      return null;
    } else if (result.length === 1) {
      return result[0];
    } else {
      return `{\n  ...` + result.join(`,\n   ...`) + `\n}`;
    }
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
