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
import { DeclarationBlock, getBaseType } from './utils';
import { NormalizedScalarsMap, ConvertNameFn, LoadedFragment } from './types';
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
    protected _scalars: NormalizedScalarsMap,
    protected _schema: GraphQLSchema,
    protected _convertName: ConvertNameFn<BaseVisitorConvertOptions>,
    protected _addTypename: boolean,
    protected _preResolveTypes: boolean,
    protected _nonOptionalTypename: boolean,
    protected _loadedFragments: LoadedFragment[],
    protected _namespacedImportName: string | null,
    protected _dedupeOperationSuffix: boolean,
    protected _enumPrefix: boolean,
    protected _parentSchemaType?: GraphQLNamedType,
    protected _selectionSet?: SelectionSetNode
  ) {}

  public createNext(parentSchemaType: GraphQLNamedType, selectionSet: SelectionSetNode): SelectionSetToObject {
    throw new Error(`You must override createNext in your SelectionSetToObject implementation!`);
  }

  protected wrapTypeWithModifiers(baseType: string, type: GraphQLObjectType | GraphQLNonNull<GraphQLObjectType> | GraphQLList<GraphQLObjectType>): string {
    throw new Error(`You must override wrapTypeWithModifiers in your SelectionSetToObject implementation!`);
  }

  private separateSelectionSet(selections: ReadonlyArray<SelectionNode>): { fields: FieldNode[]; spreads: FragmentSpreadNode[]; inlines: InlineFragmentNode[] } {
    return {
      fields: selections.filter(s => s.kind === Kind.FIELD) as FieldNode[],
      inlines: selections.filter(s => s.kind === Kind.INLINE_FRAGMENT) as InlineFragmentNode[],
      spreads: selections.filter(s => s.kind === Kind.FRAGMENT_SPREAD) as FragmentSpreadNode[],
    };
  }

  /**
   * traverse the inline fragment nodes recursively for colleting the selectionSets on each type
   */
  _collectInlineFragments(parentType: GraphQLNamedType, nodes: InlineFragmentNode[], types: Map<string, Array<SelectionNode | string>>) {
    if (isListType(parentType) || isNonNullType(parentType)) {
      return this._collectInlineFragments(parentType.ofType, nodes, types);
    } else if (isObjectType(parentType)) {
      for (const node of nodes) {
        const typeOnSchema = node.typeCondition ? this._schema.getType(node.typeCondition.name.value) : parentType;
        const { fields, inlines, spreads } = this.separateSelectionSet(node.selectionSet.selections);
        const spreadsUsage = this.buildFragmentSpreadsUsage(spreads);

        if (isObjectType(typeOnSchema)) {
          this._appendToTypeMap(types, typeOnSchema.name, fields);
          this._appendToTypeMap(types, typeOnSchema.name, spreadsUsage[typeOnSchema.name]);
          this._collectInlineFragments(typeOnSchema, inlines, types);
        } else if (isInterfaceType(typeOnSchema) && parentType.isTypeOf(typeOnSchema, null, null)) {
          this._appendToTypeMap(types, parentType.name, fields);
          this._appendToTypeMap(types, parentType.name, spreadsUsage[parentType.name]);
          this._collectInlineFragments(typeOnSchema, inlines, types);
        }
      }
    } else if (isInterfaceType(parentType)) {
      const possibleTypes = this._getPossibleTypes(parentType);

      for (const node of nodes) {
        const schemaType = node.typeCondition ? this._schema.getType(node.typeCondition.name.value) : parentType;
        const { fields, inlines, spreads } = this.separateSelectionSet(node.selectionSet.selections);
        const spreadsUsage = this.buildFragmentSpreadsUsage(spreads);

        if (isObjectType(schemaType) && possibleTypes.find(possibleType => possibleType.name === schemaType.name)) {
          this._appendToTypeMap(types, schemaType.name, fields);
          this._appendToTypeMap(types, schemaType.name, spreadsUsage[schemaType.name]);
          this._collectInlineFragments(schemaType, inlines, types);
        } else if (isInterfaceType(schemaType) && schemaType.name === parentType.name) {
          for (const possibleType of possibleTypes) {
            this._appendToTypeMap(types, possibleType.name, fields);
            this._appendToTypeMap(types, possibleType.name, spreadsUsage[possibleType.name]);
            this._collectInlineFragments(schemaType, inlines, types);
          }
        }
      }
    } else if (isUnionType(parentType)) {
      const possibleTypes = parentType.getTypes();

      for (const node of nodes) {
        const schemaType = node.typeCondition ? this._schema.getType(node.typeCondition.name.value) : parentType;
        const { fields, inlines, spreads } = this.separateSelectionSet(node.selectionSet.selections);
        const spreadsUsage = this.buildFragmentSpreadsUsage(spreads);

        if (isObjectType(schemaType) && possibleTypes.find(possibleType => possibleType.name === schemaType.name)) {
          this._appendToTypeMap(types, schemaType.name, fields);
          this._appendToTypeMap(types, schemaType.name, spreadsUsage[schemaType.name]);
          this._collectInlineFragments(schemaType, inlines, types);
        } else if (isInterfaceType(schemaType)) {
          const possibleInterfaceTypes = this._getPossibleTypes(schemaType);

          for (const possibleType of possibleTypes) {
            if (possibleInterfaceTypes.find(possibleInterfaceType => possibleInterfaceType.name === possibleType.name)) {
              this._appendToTypeMap(types, possibleType.name, fields);
              this._appendToTypeMap(types, possibleType.name, spreadsUsage[possibleType.name]);
              this._collectInlineFragments(schemaType, inlines, types);
            }
          }
        }
      }
    }
  }

  protected _getPossibleTypes(type: GraphQLNamedType): GraphQLObjectType[] {
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

  protected buildFragmentSpreadsUsage(spreads: FragmentSpreadNode[]): Record<string, string[]> {
    const selectionNodesByTypeName = {};

    for (const spread of spreads) {
      const fragmentSpreadObject = this._loadedFragments.find(lf => lf.name === spread.name.value);

      if (fragmentSpreadObject) {
        const schemaType = this._schema.getType(fragmentSpreadObject.onType);
        const possibleTypesForFragment = this._getPossibleTypes(schemaType);

        for (const possibleType of possibleTypesForFragment) {
          const fragmentSuffix = this._dedupeOperationSuffix && spread.name.value.toLowerCase().endsWith('fragment') ? '' : 'Fragment';
          const usage = this.buildFragmentTypeName(spread.name.value, fragmentSuffix, possibleTypesForFragment.length === 1 ? null : possibleType.name);

          if (!selectionNodesByTypeName[possibleType.name]) {
            selectionNodesByTypeName[possibleType.name] = [];
          }

          selectionNodesByTypeName[possibleType.name].push(usage);
        }
      }
    }

    return selectionNodesByTypeName;
  }

  protected flattenSelectionSet(selections: ReadonlyArray<SelectionNode>): Map<string, Array<SelectionNode | string>> {
    const selectionNodesByTypeName = new Map<string, Array<SelectionNode | string>>();
    const inlineFragmentSelections: InlineFragmentNode[] = [];
    const fieldNodes: FieldNode[] = [];
    const fragmentSpreads: FragmentSpreadNode[] = [];

    for (const selection of selections) {
      switch (selection.kind) {
        case Kind.FIELD:
          fieldNodes.push(selection);
          break;
        case Kind.INLINE_FRAGMENT:
          inlineFragmentSelections.push(selection);
          break;
        case Kind.FRAGMENT_SPREAD:
          fragmentSpreads.push(selection);
          break;
      }
    }

    if (fieldNodes.length) {
      inlineFragmentSelections.push(this._createInlineFragmentForFieldNodes(this._parentSchemaType, fieldNodes));
    }

    this._collectInlineFragments(this._parentSchemaType, inlineFragmentSelections, selectionNodesByTypeName);
    const fragmentsUsage = this.buildFragmentSpreadsUsage(fragmentSpreads);

    Object.keys(fragmentsUsage).forEach(typeName => {
      this._appendToTypeMap(selectionNodesByTypeName, typeName, fragmentsUsage[typeName]);
    });

    return selectionNodesByTypeName;
  }

  private _appendToTypeMap<T = SelectionNode | string>(types: Map<string, Array<T>>, typeName: string, nodes: Array<T>): void {
    if (!types.has(typeName)) {
      types.set(typeName, []);
    }

    if (nodes && nodes.length > 0) {
      types.get(typeName).push(...nodes);
    }
  }

  protected _buildGroupedSelections(): Record<string, string[]> {
    if (!this._selectionSet || !this._selectionSet.selections || this._selectionSet.selections.length === 0) {
      return {};
    }

    const selectionNodesByTypeName = this.flattenSelectionSet(this._selectionSet.selections);

    const grouped = this._getPossibleTypes(this._parentSchemaType).reduce(
      (prev, type) => {
        const typeName = type.name;
        const schemaType = this._schema.getType(typeName);

        if (!isObjectType(schemaType)) {
          throw new TypeError(`Invalid state! Schema type ${typeName} is not a valid GraphQL object!`);
        }

        const selectionNodes = selectionNodesByTypeName.get(typeName) || [];

        if (!prev[typeName]) {
          prev[typeName] = [];
        }

        const transformedSet = this.buildSelectionSetString(schemaType, selectionNodes);

        if (transformedSet) {
          prev[typeName].push(transformedSet);
        }

        return prev;
      },
      {} as Record<string, string[]>
    );

    return grouped;
  }

  protected buildSelectionSetString(parentSchemaType: GraphQLObjectType, selectionNodes: Array<SelectionNode | string>) {
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
    const fragmentsSpreadUsages: string[] = [];

    for (const selectionNode of selectionNodes) {
      if (typeof selectionNode === 'string') {
        fragmentsSpreadUsages.push(selectionNode);
      } else if (selectionNode.kind === 'Field') {
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
        selectionSet: this.wrapTypeWithModifiers(
          selectionSet
            .transformSelectionSet()
            .split(`\n`)
            .join(`\n  `),
          selectedFieldType as any
        ),
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
    const fields = [typeInfoString, primitiveFieldsString, primitiveAliasFieldsString, linkFieldsString, ...fragmentsSpreadUsages].filter(Boolean);

    if (fields.length === 0) {
      return null;
    } else if (fields.length === 1) {
      return fields[0];
    } else {
      return `(\n  ${fields.join(`\n  & `)}\n)`;
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
        typeToUse = (this._namespacedImportName ? `${this._namespacedImportName}.` : '') + this._convertName(baseType.name, { useTypesPrefix: this._enumPrefix });
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

  public transformSelectionSet(): string {
    const grouped = this._buildGroupedSelections();

    return Object.keys(grouped)
      .map(typeName => {
        const relevant = grouped[typeName].filter(Boolean);

        if (relevant.length === 0) {
          return null;
        } else if (relevant.length === 1) {
          return relevant[0];
        } else {
          return `( ${relevant.join(' & ')} )`;
        }
      })
      .filter(Boolean)
      .join(' | ');
  }

  public transformFragmentSelectionSetToTypes(fragmentName: string, fragmentSuffix: string, declarationBlockConfig): string {
    const grouped = this._buildGroupedSelections();

    const subTypes: { name: string; content: string }[] = Object.keys(grouped)
      .map(typeName => {
        const possibleFields = grouped[typeName].filter(Boolean);

        if (possibleFields.length === 0) {
          return null;
        }

        const declarationName = this.buildFragmentTypeName(fragmentName, fragmentSuffix, typeName);

        return { name: declarationName, content: possibleFields.join(' & ') };
      })
      .filter(Boolean);

    if (subTypes.length === 1) {
      return new DeclarationBlock(declarationBlockConfig)
        .export()
        .asKind('type')
        .withName(this.buildFragmentTypeName(fragmentName, fragmentSuffix))
        .withContent(subTypes[0].content).string;
    }

    return [
      ...subTypes.map(
        t =>
          new DeclarationBlock(declarationBlockConfig)
            .export()
            .asKind('type')
            .withName(t.name)
            .withContent(t.content).string
      ),
      new DeclarationBlock(declarationBlockConfig)
        .export()
        .asKind('type')
        .withName(this.buildFragmentTypeName(fragmentName, fragmentSuffix))
        .withContent(subTypes.map(t => t.name).join(' | ')).string,
    ].join('\n');
  }

  protected buildFragmentTypeName(name: string, suffix: string, typeName = ''): string {
    return this._convertName(name, {
      useTypesPrefix: true,
      suffix: typeName ? `_${typeName}_${suffix}` : suffix,
    });
  }
}
