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
  isScalarType,
  GraphQLInterfaceType,
  SelectionNode,
  isListType,
  isNonNullType,
  GraphQLOutputType,
} from 'graphql';
import { getBaseType, quoteIfNeeded, isRootType, getBaseTypeNode } from './utils';
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

  _collectField(field: FieldNode) {
    if (field.name.value === '__typename') {
      this._queriedForTypename = true;

      return;
    }

    if (isObjectType(this._parentSchemaType) || isInterfaceType(this._parentSchemaType)) {
      let schemaField: GraphQLField<any, any>;

      if (isRootType(this._parentSchemaType, this._schema) && isMetadataFieldName(field.name.value)) {
        schemaField = metadataFieldMap[field.name.value];
      } else {
        schemaField = this._parentSchemaType.getFields()[field.name.value];
      }

      const rawType = schemaField.type as any;
      const baseType = getBaseType(rawType);

      if (!baseType) {
        throw new Error(`Unable to find a type called "${rawType}" in your schema!`);
      }

      const typeName = baseType.name;

      if (this._scalars[typeName] || isEnumType(baseType) || isScalarType(baseType)) {
        if (field.alias && field.alias.value) {
          this._primitiveAliasedFields.push({
            fieldName: field.name.value,
            alias: field.alias.value,
          });
        } else {
          this._primitiveFields.push(field.name.value);
        }
      } else {
        const selectionSetToObject = this.createNext(baseType, field.selectionSet);

        this._linksFields.push({
          alias: field.alias ? field.alias.value : null,
          name: field.name.value,
          type: typeName,
          selectionSet: this.wrapTypeWithModifiers(selectionSetToObject.string, rawType),
        });
      }
    }
  }

  _collectFragmentSpread(node: FragmentSpreadNode) {
    const loadedFragment = this._loadedFragments.find(f => f.name === node.name.value);

    if (!loadedFragment) {
      throw new Error(`Unable to find fragment matching then name "${node.name.value}"! Please make sure it's loaded.`);
    }

    if (!this._fragments[loadedFragment.onType]) {
      this._fragments[loadedFragment.onType] = [];
    }

    const fragmentSuffix = this._dedupeOperationSuffix && node.name.value.toLowerCase().endsWith('fragment') ? '' : 'Fragment';
    this._fragments[loadedFragment.onType].push(this._convertName(node.name.value, { useTypesPrefix: true, suffix: fragmentSuffix }));
  }

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
      const possibleTypes = this._schema.getPossibleTypes(parentType);

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
          const possibleInterfaceTypes = this._schema.getPossibleTypes(schemaType);
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

  _collectInlineFragment(node: InlineFragmentNode) {
    const onType = node.typeCondition.name.value;
    const schemaType = this._schema.getType(onType);

    if (!schemaType) {
      throw new Error(`Inline fragment refernces a GraphQL type "${onType}" that does not exists in your schema!`);
    }

    const selectionSet = this.createNext(schemaType, node.selectionSet);

    if (!this._fragments[onType]) {
      this._fragments[onType] = [];
    }

    this._fragments[onType].push(selectionSet.string);
  }

  get string(): string {
    if (!this._selectionSet || !this._selectionSet.selections || this._selectionSet.selections.length === 0) {
      return '';
    }

    const { selections } = this._selectionSet;

    const inlineFragmentSelections: InlineFragmentNode[] = [];
    const fieldNodes: FieldNode[] = [];

    for (const selection of selections) {
      switch (selection.kind) {
        case Kind.FIELD:
          fieldNodes.push(selection);
          break;
        case Kind.FRAGMENT_SPREAD:
          this._collectFragmentSpread(selection as FragmentSpreadNode);
          break;
        case Kind.INLINE_FRAGMENT:
          inlineFragmentSelections.push(selection);
          break;
      }
    }

    if (inlineFragmentSelections.length) {
      for (const fieldNode of fieldNodes) {
        const inlineFragment: InlineFragmentNode = {
          kind: Kind.INLINE_FRAGMENT,
          typeCondition: {
            kind: Kind.NAMED_TYPE,
            name: {
              kind: Kind.NAME,
              value: this._parentSchemaType.name,
            },
          },
          directives: [],
          selectionSet: {
            kind: Kind.SELECTION_SET,
            selections: [fieldNode],
          },
        };
        inlineFragmentSelections.push(inlineFragment);
      }

      const types = new Map<string, SelectionNode[]>();
      this._collectInlineFragments(this._parentSchemaType, inlineFragmentSelections, types);

      return Array.from(types.entries())
        .map(([name, fields]) => {
          const primitiveFields: FieldNode[] = [];
          const primitiveAliasFields: FieldNode[] = [];
          const linkFieldSelectionSets = new Map<
            string,
            {
              selectedFieldType: GraphQLOutputType;
              field: FieldNode;
            }
          >();
          let requireTypename = false;

          for (const field of fields as FieldNode[]) {
            if (!field.selectionSet) {
              if (field.alias) {
                primitiveAliasFields.push(field);
              } else if (field.name.value === '__typename') {
                requireTypename = true;
              } else {
                primitiveFields.push(field);
              }
            } else {
              let selectedField: GraphQLField<any, any, any> = null;

              if (isObjectType(this._parentSchemaType)) {
                const fields = this._parentSchemaType.getFields();
                selectedField = fields[field.name.value];
              } else if (isInterfaceType(this._parentSchemaType)) {
                const fields = this._parentSchemaType.getFields();
                selectedField = fields[field.name.value];
                if (!selectedField) {
                  const possibleTypes = this._schema.getPossibleTypes(this._parentSchemaType);
                  for (const possibleType of possibleTypes) {
                    selectedField = possibleType.getFields()[field.name.value];
                    if (selectedField) {
                      break;
                    }
                  }
                }
              } else if (isUnionType(this._parentSchemaType)) {
                const types = this._parentSchemaType.getTypes();
                for (const type of types) {
                  const fields = type.getFields();
                  selectedField = fields[field.name.value];
                  if (selectedField) {
                    break;
                  }
                }
              }

              if (!selectedField) {
                throw new TypeError(`Could not find field type. ${this._parentSchemaType}.${field.name.value}`);
              }

              const fieldName = getFieldNodeNameValue(field);
              let linkFieldNode = linkFieldSelectionSets.get(fieldName);
              if (!linkFieldNode) {
                linkFieldNode = {
                  selectedFieldType: selectedField.type,
                  field,
                };
                linkFieldSelectionSets.set(fieldName, linkFieldNode);
              } else {
                mergeSelectionSets(linkFieldNode.field.selectionSet, field.selectionSet);
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
              selectionSet: this.wrapTypeWithModifiers(selectionSet.string, selectedFieldType as any),
            });
          }

          const parentName =
            (this._namespacedImportName ? `${this._namespacedImportName}.` : '') +
            this._convertName(name, {
              useTypesPrefix: true,
            });
          let typeInfoString: null | string = null;
          if (this._nonOptionalTypename || this._addTypename || this._queriedForTypename) {
            const optionalTypename = !requireTypename && !this._nonOptionalTypename;
            typeInfoString = `{ ${this.formatNamedField('__typename')}${optionalTypename ? '?' : ''}: '${name}' }`;
          }
          const primitiveFieldsString = this.buildPrimitiveFields(parentName, primitiveFields.map(field => field.name.value));
          const linkFieldsString = this.buildLinkFields(linkFields);

          return '(\n  ' + [typeInfoString, primitiveFieldsString, linkFieldsString].filter(Boolean).join('\n  & ') + '\n)';
        })
        .join(' | ');
    } else {
      for (const fieldNode of fieldNodes) {
        this._collectField(fieldNode);
      }
    }

    if (this._preResolveTypes) {
      return this.buildFieldsWithoutPick();
    } else {
      return this.buildFieldsWithPick();
    }
  }

  protected buildFieldsWithoutPick(): string {
    const typeName = this.buildTypeNameField();
    const baseFields = this.buildPrimitiveFieldsWithoutPick(this._parentSchemaType as any, this._primitiveFields);
    const linksFields = this.buildLinkFieldsWithoutPick(this._linksFields);
    const aliasBaseFields = this.buildAliasedPrimitiveFieldsWithoutPick(this._parentSchemaType as any, this._primitiveAliasedFields);
    const fragments = this.buildFragments(this._fragments);
    let mergedFields = `{ ${[typeName, ...baseFields, ...aliasBaseFields, ...linksFields]
      .filter(a => a)
      .map(b => `${b.name}: ${b.type}`)
      .join(', ')} }`;

    if (fragments && fragments !== '') {
      mergedFields = this.mergeAllFields([mergedFields, fragments]);
    }

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

  protected buildFieldsWithPick(): string {
    const parentName =
      (this._namespacedImportName ? `${this._namespacedImportName}.` : '') +
      this._convertName(this._parentSchemaType.name, {
        useTypesPrefix: true,
      });
    const typeName = this.buildTypeNameField();
    const baseFields = this.buildPrimitiveFields(parentName, this._primitiveFields);
    const aliasBaseFields = this.buildAliasedPrimitiveFields(parentName, this._primitiveAliasedFields);
    const linksFields = this.buildLinkFields(this._linksFields);
    const fragments = this.buildFragments(this._fragments);
    const fieldsSet = [typeName ? `{ ${typeName.name}: ${typeName.type} }` : '', baseFields, aliasBaseFields, linksFields, fragments].filter(f => f && f !== '');

    return this.mergeAllFields(fieldsSet);
  }

  protected mergeAllFields(fieldsSet: Array<string | null>): string {
    return quoteIfNeeded(fieldsSet, ' & ');
  }

  protected getImplementingTypes(node: GraphQLInterfaceType): string[] {
    const allTypesMap = this._schema.getTypeMap();
    const implementingTypes: string[] = [];

    for (const graphqlType of Object.values(allTypesMap)) {
      if (graphqlType instanceof GraphQLObjectType) {
        const allInterfaces = graphqlType.getInterfaces();
        if (allInterfaces.find(int => int.name === ((node.name as any) as string))) {
          implementingTypes.push(graphqlType.name);
        }
      }
    }

    return implementingTypes;
  }

  protected buildTypeNameField(): { name: string; type: string } {
    if (this._nonOptionalTypename || this._addTypename || this._queriedForTypename) {
      const possibleTypes = [];

      if (isUnionType(this._parentSchemaType)) {
        return null;
      } else if (isInterfaceType(this._parentSchemaType)) {
        possibleTypes.push(...this.getImplementingTypes(this._parentSchemaType));
      } else {
        possibleTypes.push(this._parentSchemaType.name);
      }

      if (possibleTypes.length === 0) {
        return null;
      }

      const optionalTypename = !this._queriedForTypename && !this._nonOptionalTypename;

      return {
        name: `${this.formatNamedField('__typename')}${optionalTypename ? '?' : ''}`,
        type: `${possibleTypes.map(t => `'${t}'`).join(' | ')}`,
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

  protected buildFragments(fragments: FragmentsMap): string | null {
    if (isUnionType(this._parentSchemaType) || isInterfaceType(this._parentSchemaType)) {
      return this._handleFragmentsForUnionAndInterface(fragments);
    } else if (isObjectType(this._parentSchemaType)) {
      return this._handleFragmentsForObjectType(fragments);
    }

    return null;
  }

  protected _handleFragmentsForObjectType(fragments: FragmentsMap): string | null {
    const fragmentsValue = Object.keys(fragments).reduce((prev, fragmentName) => {
      const fragmentArr = fragments[fragmentName];

      return [...prev, ...fragmentArr];
    }, []);

    return quoteIfNeeded(fragmentsValue, ' & ');
  }

  protected _handleFragmentsForUnionAndInterface(fragments: FragmentsMap): string | null {
    const interfaces: { [onType: string]: { fragments: string[]; implementingFragments: string[] } } = {};
    const types: { [onType: string]: { fragments: string[]; implementingFragments: string[] } } = {};
    const onInterfaces = Object.keys(fragments).filter(typeName => isInterfaceType(this._schema.getType(typeName)));
    const onNonInterfaces = Object.keys(fragments).filter(typeName => !isInterfaceType(this._schema.getType(typeName)));

    for (const typeName of onInterfaces) {
      const interfaceFragments = fragments[typeName];

      interfaces[typeName] = {
        fragments: interfaceFragments,
        implementingFragments: [],
      };
    }

    for (const typeName of onNonInterfaces) {
      const schemaType = this._schema.getType(typeName) as GraphQLObjectType;

      if (!schemaType) {
        throw new Error(`Inline fragment refernces a GraphQL type "${typeName}" that does not exists in your schema!`);
      }

      const typeFragments = fragments[typeName];
      const interfacesFragments = schemaType.getInterfaces === undefined ? [] : schemaType.getInterfaces().filter(gqlInterface => !!interfaces[gqlInterface.name]);

      if (interfacesFragments.length > 0) {
        for (const relevantInterface of interfacesFragments) {
          interfaces[relevantInterface.name].implementingFragments.push(...typeFragments);
        }
      } else {
        types[typeName] = {
          fragments: typeFragments,
          implementingFragments: [],
        };
      }
    }

    const mergedResult = { ...interfaces, ...types };

    return quoteIfNeeded(
      Object.keys(mergedResult).map(typeName => {
        const baseFragments = quoteIfNeeded(mergedResult[typeName].fragments, ' & ');
        const implementingFragments = quoteIfNeeded(mergedResult[typeName].implementingFragments, ' | ');

        return quoteIfNeeded([baseFragments, implementingFragments].filter(a => a), ' & ');
      }),
      ' | '
    );
  }
}
