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
  GraphQLSchema,
  GraphQLField,
  SchemaMetaFieldDef,
  TypeMetaFieldDef,
  GraphQLInterfaceType,
  SelectionNode,
  isListType,
  isNonNullType,
  GraphQLOutputType,
  isAbstractType,
} from 'graphql';
import { getBaseType } from './utils';
import { ScalarsMap, ConvertNameFn, LoadedFragment } from './types';
import { GraphQLObjectType, GraphQLNonNull, GraphQLList } from 'graphql';
import { BaseVisitorConvertOptions } from './base-visitor';

export type PrimitiveField = string;
export type PrimitiveAliasedFields = { alias: string; fieldName: string };
export type LinkField = { alias: string; name: string; type: string; selectionSet: string };
export type FragmentsMap = { [onType: string]: string[] };

function isMetadataFieldName(name: string) {
  return ['__schema', '__type'].includes(name);
}

const metadataFieldMap: Record<string, GraphQLField<any, any>> = {
  __schema: SchemaMetaFieldDef,
  __type: TypeMetaFieldDef,
};

const getFieldNodeNameValue = (node: FieldNode): string => {
  return (node.alias || node.name).value;
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

export class SelectionSetToObject {
  protected _primitiveFields: PrimitiveField[] = [];
  protected _primitiveAliasedFields: PrimitiveAliasedFields[] = [];
  protected _linksFields: LinkField[] = [];
  protected _fragments: FragmentsMap = {};
  protected _queriedForTypename = false;

  constructor(
    protected _scalars: ScalarsMap,
    protected _schema: GraphQLSchema,
    protected _convertName: ConvertNameFn<BaseVisitorConvertOptions>,
    protected _addTypename: boolean,
    protected _preResolveTypes: boolean,
    protected _nonOptionalTypename: boolean,
    protected _loadedFragments: LoadedFragment[],
    protected _namespacedImportName: string | null,
    protected _dedupeOperationSuffix: boolean,
    protected _parentSchemaType?: GraphQLNamedType,
    protected _selectionSet?: SelectionSetNode
  ) {}

  public createNext(parentSchemaType: GraphQLNamedType, selectionSet: SelectionSetNode): SelectionSetToObject {
    throw new Error(`You must override createNext in your SelectionSetToObject implementation!`);
  }

  protected wrapTypeWithModifiers(baseType: string, type: GraphQLObjectType | GraphQLNonNull<GraphQLObjectType> | GraphQLList<GraphQLObjectType>): string {
    throw new Error(`You must override wrapTypeWithModifiers in your SelectionSetToObject implementation!`);
  }

  /**
   * traverse the inline fragment nodes recursively for colleting the selectionSets on each type
   */
  _collectInlineFragments(parentType: GraphQLNamedType, nodes: InlineFragmentNode[], types: Map<string, SelectionNode[]>) {
    if (isListType(parentType) || isNonNullType(parentType)) {
      return this._collectInlineFragments(parentType.ofType, nodes, types);
    } else if (isObjectType(parentType)) {
      for (const node of nodes) {
        const onType = node.typeCondition.name.value;
        const typeOnSchema = this._schema.getType(onType);
        if (isObjectType(typeOnSchema)) {
          let typeSelections = types.get(typeOnSchema.name);
          if (!typeSelections) {
            typeSelections = [];
            types.set(typeOnSchema.name, typeSelections);
          }
          typeSelections.push(...node.selectionSet.selections.filter(selection => selection.kind === 'Field'));

          this._collectInlineFragments(typeOnSchema, node.selectionSet.selections.filter(selection => selection.kind === 'InlineFragment') as InlineFragmentNode[], types);
        } else if (isInterfaceType(typeOnSchema) && parentType.isTypeOf(typeOnSchema, null, null)) {
          let typeSelections = types.get(parentType.name);
          if (!typeSelections) {
            typeSelections = [];
            types.set(parentType.name, typeSelections);
          }
          typeSelections.push(...node.selectionSet.selections.filter(selection => selection.kind === 'Field'));

          this._collectInlineFragments(typeOnSchema, node.selectionSet.selections.filter(selection => selection.kind === 'InlineFragment') as InlineFragmentNode[], types);
        }
      }
    } else if (isInterfaceType(parentType)) {
      const possibleTypes = this._getPossibleTypes(parentType);

      for (const node of nodes) {
        const onType = node.typeCondition.name.value;
        const schemaType = this._schema.getType(onType);

        if (!schemaType) {
          throw new Error(`Inline fragment refernces a GraphQL type "${onType}" that does not exists in your schema!`);
        }

        if (isObjectType(schemaType) && possibleTypes.find(possibleType => possibleType.name === schemaType.name)) {
          let typeSelections = types.get(onType);
          if (!typeSelections) {
            typeSelections = [];
            types.set(schemaType.name, typeSelections);
          }

          typeSelections.push(...node.selectionSet.selections.filter(selection => selection.kind === 'Field'));

          this._collectInlineFragments(schemaType, node.selectionSet.selections.filter(selection => selection.kind === 'InlineFragment') as InlineFragmentNode[], types);
        } else if (isInterfaceType(schemaType) && schemaType.name === parentType.name) {
          for (const possibleType of possibleTypes) {
            let typeSelections = types.get(possibleType.name);
            if (!typeSelections) {
              typeSelections = [];
              types.set(possibleType.name, typeSelections);
            }
            typeSelections.push(...node.selectionSet.selections.filter(selection => selection.kind === 'Field'));

            this._collectInlineFragments(schemaType, node.selectionSet.selections.filter(selection => selection.kind === 'InlineFragment') as InlineFragmentNode[], types);
          }
        }
      }
    } else if (isUnionType(parentType)) {
      const possibleTypes = parentType.getTypes();

      for (const node of nodes) {
        const onType = node.typeCondition.name.value;
        const schemaType = this._schema.getType(onType);

        if (!schemaType) {
          throw new Error(`Inline fragment refernces a GraphQL type "${onType}" that does not exists in your schema!`);
        }

        if (isObjectType(schemaType) && possibleTypes.find(possibleType => possibleType.name === schemaType.name)) {
          let typeSelections = types.get(onType);
          if (!typeSelections) {
            typeSelections = [];
            types.set(onType, typeSelections);
          }

          typeSelections.push(...node.selectionSet.selections.filter(selection => selection.kind === 'Field'));

          this._collectInlineFragments(schemaType, node.selectionSet.selections.filter(selection => selection.kind === 'InlineFragment') as InlineFragmentNode[], types);
        } else if (isInterfaceType(schemaType)) {
          const possibleInterfaceTypes = this._getPossibleTypes(schemaType);
          for (const possibleType of possibleTypes) {
            if (possibleInterfaceTypes.find(possibleInterfaceType => possibleInterfaceType.name === possibleType.name)) {
              let typeSelections = types.get(possibleType.name);
              if (!typeSelections) {
                typeSelections = [];
                types.set(possibleType.name, typeSelections);
              }

              typeSelections.push(...node.selectionSet.selections.filter(selection => selection.kind === 'Field'));

              this._collectInlineFragments(schemaType, node.selectionSet.selections.filter(selection => selection.kind === 'InlineFragment') as InlineFragmentNode[], types);
            }
          }
        }
      }
    }
  }

  protected _getPossibleTypes(type: GraphQLNamedType): Array<GraphQLObjectType> {
    if (isListType(type) || isNonNullType(type)) {
      return this._getPossibleTypes(type.ofType);
    } else if (isObjectType(type)) {
      return [type];
    } else if (isAbstractType(type)) {
      return this._schema.getPossibleTypes(type) as Array<GraphQLObjectType>;
    }
    return [];
  }

  protected _createInlineFragmentForFieldNodes(parentType: GraphQLNamedType, fieldNodes: FieldNode[]): InlineFragmentNode {
    return {
      kind: Kind.INLINE_FRAGMENT,
      typeCondition: {
        kind: Kind.NAMED_TYPE,
        name: {
          kind: Kind.NAME,
          value: parentType.name,
        },
      },
      directives: [],
      selectionSet: {
        kind: Kind.SELECTION_SET,
        selections: fieldNodes,
      },
    };
  }

  get string(): string {
    if (!this._selectionSet || !this._selectionSet.selections || this._selectionSet.selections.length === 0) {
      return '';
    }

    const { selections } = this._selectionSet;

    const inlineFragmentSelections: InlineFragmentNode[] = [];
    const fieldNodes: FieldNode[] = [];
    const fragmentSpreadNodes: FragmentSpreadNode[] = [];

    for (const selection of selections) {
      switch (selection.kind) {
        case Kind.FIELD:
          fieldNodes.push(selection);
          break;
        case Kind.FRAGMENT_SPREAD:
          fragmentSpreadNodes.push(selection);
          break;
        case Kind.INLINE_FRAGMENT:
          inlineFragmentSelections.push(selection);
          break;
      }
    }

    if (fieldNodes.length) {
      inlineFragmentSelections.push(this._createInlineFragmentForFieldNodes(this._parentSchemaType, fieldNodes));
    }

    const selectionNodesByTypeName = new Map<string, SelectionNode[]>();
    this._collectInlineFragments(this._parentSchemaType, inlineFragmentSelections, selectionNodesByTypeName);

    const possibleTypes = this._getPossibleTypes(this._parentSchemaType);

    const fieldSelections = possibleTypes.map(type => {
      const typeName = type.name;
      const schemaType = this._schema.getType(typeName);
      if (!isObjectType(schemaType)) {
        throw new TypeError('Invalid state.');
      }
      const selectionNodes = selectionNodesByTypeName.get(typeName) || [];
      return this.buildSelectionSetString(schemaType, selectionNodes);
    });

    let fieldSelectionString = fieldSelections.join(' | ');

    // wrap in case we have some fragment spreads
    if (fieldSelections.length > 1 && fragmentSpreadNodes.length) {
      fieldSelectionString = `(${fieldSelectionString})`;
    }

    const fragmentSelectionString: string | null = this.buildFragmentSpreadString(fragmentSpreadNodes);
    if (!fieldSelectionString && !fragmentSelectionString) {
      throw new TypeError('Invalid State.');
    }
    if (fieldSelectionString && !fragmentSelectionString) {
      return fieldSelectionString;
    } else if (!fieldSelectionString && fragmentSelectionString) {
      return fragmentSelectionString;
    }

    return fieldSelectionString + `\n  & ` + fragmentSelectionString + '\n';
  }

  protected buildFragmentSpreadString(fragmentSpreadNodes: FragmentSpreadNode[]) {
    if (!fragmentSpreadNodes.length) {
      return null;
    }

    return fragmentSpreadNodes
      .map(node => {
        const fragmentSuffix = this._dedupeOperationSuffix && node.name.value.toLowerCase().endsWith('fragment') ? '' : 'Fragment';
        return this._convertName(node.name.value, { useTypesPrefix: true, suffix: fragmentSuffix });
      })
      .join(`\n  & `);
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

          if (isObjectType(this._parentSchemaType)) {
            const fields = this._parentSchemaType.getFields();
            selectedField = fields[selectionNode.name.value];
          } else if (isInterfaceType(this._parentSchemaType)) {
            const fields = this._parentSchemaType.getFields();
            selectedField = fields[selectionNode.name.value];
            if (!selectedField) {
              const possibleTypes = this._getPossibleTypes(this._parentSchemaType);
              for (const possibleType of possibleTypes) {
                selectedField = possibleType.getFields()[selectionNode.name.value];
                if (selectedField) {
                  break;
                }
              }
            }
          } else if (isUnionType(this._parentSchemaType)) {
            const types = this._parentSchemaType.getTypes();
            for (const type of types) {
              const fields = type.getFields();
              selectedField = fields[selectionNode.name.value];
              if (selectedField) {
                break;
              }
            }
          }

          if (isMetadataFieldName(selectionNode.name.value)) {
            selectedField = metadataFieldMap[selectionNode.name.value];
          }

          if (!selectedField) {
            throw new TypeError(`Could not find field type. ${this._parentSchemaType}.${selectionNode.name.value}`);
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
      const primitiveAliasTypes = this.buildAliasedPrimitiveFieldsWithoutPick(parentSchemaType, Array.from(primitiveAliasFields.values()).map(field => ({ alias: field.alias.value, fieldName: field.name.value })));
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
    const primitiveAliasFieldsString = this.buildAliasedPrimitiveFields(parentName, Array.from(primitiveAliasFields.values()).map(field => ({ alias: field.alias.value, fieldName: field.name.value })));
    const linkFieldsString = this.buildLinkFields(linkFields);

    const result = [typeInfoString, primitiveFieldsString, primitiveAliasFieldsString, linkFieldsString].filter(Boolean);
    if (result.length === 0) {
      return null;
    } else if (result.length === 1) {
      return result[0];
    } else {
      return `(\n  ` + result.join(`\n  & `) + `\n)`;
    }
  }

  protected buildFieldsWithoutPick(parentType: GraphQLObjectType): string {
    const typeName = this.buildTypeNameField(parentType);
    const baseFields = this.buildPrimitiveFieldsWithoutPick(this._parentSchemaType as any, this._primitiveFields);
    const linksFields = this.buildLinkFieldsWithoutPick(this._linksFields);
    const aliasBaseFields = this.buildAliasedPrimitiveFieldsWithoutPick(this._parentSchemaType as any, this._primitiveAliasedFields);
    let mergedFields = `{ ${[typeName, ...baseFields, ...aliasBaseFields, ...linksFields]
      .filter(a => a)
      .map(b => `${b.name}: ${b.type}`)
      .join(', ')} }`;

    return mergedFields;
  }

  protected buildAliasedPrimitiveFieldsWithoutPick(schemaType: GraphQLObjectType | GraphQLInterfaceType, fields: PrimitiveAliasedFields[]): { name: string; type: string }[] {
    if (fields.length === 0) {
      return [];
    }

    return fields.map(aliasedField => {
      const fieldObj = schemaType.getFields()[aliasedField.fieldName];
      const baseType = getBaseType(fieldObj.type);
      const typeToUse = this._scalars[baseType.name] || baseType.name;
      const wrappedType = this.wrapTypeWithModifiers(typeToUse, fieldObj.type as GraphQLObjectType);

      return {
        name: this.formatNamedField(aliasedField.alias),
        type: wrappedType,
      };
    });
  }

  protected buildLinkFieldsWithoutPick(fields: LinkField[]): { name: string; type: string }[] {
    if (fields.length === 0) {
      return [];
    }

    return fields.map(field => ({ name: this.formatNamedField(field.alias || field.name), type: field.selectionSet }));
  }

  protected buildPrimitiveFieldsWithoutPick(schemaType: GraphQLObjectType | GraphQLInterfaceType, fields: PrimitiveField[]): { name: string; type: string }[] {
    if (fields.length === 0) {
      return [];
    }

    return fields.map(field => {
      const fieldObj = schemaType.getFields()[field];
      const baseType = getBaseType(fieldObj.type);
      let typeToUse = baseType.name;

      if (isEnumType(baseType)) {
        typeToUse = baseType
          .getValues()
          .map(v => `'${v.value}'`)
          .join(' | ');
      } else if (this._scalars[baseType.name]) {
        typeToUse = this._scalars[baseType.name];
      }

      const wrappedType = this.wrapTypeWithModifiers(typeToUse, fieldObj.type as GraphQLObjectType);

      return {
        name: this.formatNamedField(field),
        type: wrappedType,
      };
    });
  }

  protected buildTypeNameField(type: GraphQLObjectType, nonOptionalTypename: boolean = this._nonOptionalTypename, addTypename: boolean = this._addTypename, queriedForTypename: boolean = this._queriedForTypename): { name: string; type: string } {
    if (nonOptionalTypename || addTypename || queriedForTypename) {
      const optionalTypename = !queriedForTypename && !nonOptionalTypename;

      return {
        name: `${this.formatNamedField('__typename')}${optionalTypename ? '?' : ''}`,
        type: `'${type.name}'`,
      };
    }
    return null;
  }

  protected buildPrimitiveFields(parentName: string, fields: PrimitiveField[]): string | null {
    if (fields.length === 0) {
      return null;
    }

    return `Pick<${parentName}, ${fields.map(field => `'${field}'`).join(' | ')}>`;
  }

  protected buildAliasedPrimitiveFields(parentName: string, fields: PrimitiveAliasedFields[]): string | null {
    if (fields.length === 0) {
      return null;
    }

    return `{ ${fields.map(aliasedField => `${this.formatNamedField(aliasedField.alias)}: ${parentName}['${aliasedField.fieldName}']`).join(', ')} }`;
  }

  protected formatNamedField(name: string): string {
    return name;
  }

  protected buildLinkFields(fields: LinkField[]): string | null {
    if (fields.length === 0) {
      return null;
    }

    return `{ ${fields.map(field => `${this.formatNamedField(field.alias || field.name)}: ${field.selectionSet}`).join(', ')} }`;
  }
}
