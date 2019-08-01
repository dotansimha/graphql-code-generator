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
} from 'graphql';
import { getBaseType, quoteIfNeeded, isRootType } from './utils';
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

    this._fragments[loadedFragment.onType].push(this._convertName(node.name.value, { useTypesPrefix: true, suffix: 'Fragment' }));
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
      const typeToUse = this._scalars[baseType.name] || baseType.name;
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
