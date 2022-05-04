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
  GraphQLSchema,
  GraphQLField,
  SchemaMetaFieldDef,
  TypeMetaFieldDef,
  SelectionNode,
  isListType,
  isNonNullType,
  GraphQLObjectType,
  GraphQLOutputType,
  isTypeSubTypeOf,
  DirectiveNode,
} from 'graphql';
import {
  getPossibleTypes,
  separateSelectionSet,
  getFieldNodeNameValue,
  DeclarationBlock,
  mergeSelectionSets,
  hasConditionalDirectives,
} from './utils';
import { NormalizedScalarsMap, ConvertNameFn, LoadedFragment, GetFragmentSuffixFn } from './types';
import { BaseVisitorConvertOptions } from './base-visitor';
import { getBaseType } from '@graphql-codegen/plugin-helpers';
import { ParsedDocumentsConfig } from './base-documents-visitor';
import {
  LinkField,
  PrimitiveAliasedFields,
  PrimitiveField,
  BaseSelectionSetProcessor,
  ProcessResult,
  NameAndType,
} from './selection-set-processor/base';
import autoBind from 'auto-bind';
import { getRootTypes } from '@graphql-tools/utils';

type FragmentSpreadUsage = {
  fragmentName: string;
  typeName: string;
  onType: string;
  selectionNodes: Array<SelectionNode>;
};

function isMetadataFieldName(name: string) {
  return ['__schema', '__type'].includes(name);
}

const metadataFieldMap: Record<string, GraphQLField<any, any>> = {
  __schema: SchemaMetaFieldDef,
  __type: TypeMetaFieldDef,
};

export class SelectionSetToObject<Config extends ParsedDocumentsConfig = ParsedDocumentsConfig> {
  protected _primitiveFields: PrimitiveField[] = [];
  protected _primitiveAliasedFields: PrimitiveAliasedFields[] = [];
  protected _linksFields: LinkField[] = [];
  protected _queriedForTypename = false;

  constructor(
    protected _processor: BaseSelectionSetProcessor<any>,
    protected _scalars: NormalizedScalarsMap,
    protected _schema: GraphQLSchema,
    protected _convertName: ConvertNameFn<BaseVisitorConvertOptions>,
    protected _getFragmentSuffix: GetFragmentSuffixFn,
    protected _loadedFragments: LoadedFragment[],
    protected _config: Config,
    protected _parentSchemaType?: GraphQLNamedType,
    protected _selectionSet?: SelectionSetNode
  ) {
    autoBind(this);
  }

  public createNext(parentSchemaType: GraphQLNamedType, selectionSet: SelectionSetNode): SelectionSetToObject {
    return new SelectionSetToObject(
      this._processor,
      this._scalars,
      this._schema,
      this._convertName.bind(this),
      this._getFragmentSuffix.bind(this),
      this._loadedFragments,
      this._config,
      parentSchemaType,
      selectionSet
    );
  }

  /**
   * traverse the inline fragment nodes recursively for collecting the selectionSets on each type
   */
  _collectInlineFragments(
    parentType: GraphQLNamedType,
    nodes: InlineFragmentNode[],
    types: Map<string, Array<SelectionNode | FragmentSpreadUsage | DirectiveNode>>
  ) {
    if (isListType(parentType) || isNonNullType(parentType)) {
      return this._collectInlineFragments(parentType.ofType as GraphQLNamedType, nodes, types);
    } else if (isObjectType(parentType)) {
      for (const node of nodes) {
        const typeOnSchema = node.typeCondition ? this._schema.getType(node.typeCondition.name.value) : parentType;
        const { fields, inlines, spreads } = separateSelectionSet(node.selectionSet.selections);
        const spreadsUsage = this.buildFragmentSpreadsUsage(spreads);
        const directives = (node.directives as DirectiveNode[]) || undefined;

        if (isObjectType(typeOnSchema)) {
          this._appendToTypeMap(types, typeOnSchema.name, fields);
          this._appendToTypeMap(types, typeOnSchema.name, spreadsUsage[typeOnSchema.name]);
          this._appendToTypeMap(types, typeOnSchema.name, directives);
          this._collectInlineFragments(typeOnSchema, inlines, types);
        } else if (isInterfaceType(typeOnSchema) && parentType.getInterfaces().includes(typeOnSchema)) {
          this._appendToTypeMap(types, parentType.name, fields);
          this._appendToTypeMap(types, parentType.name, spreadsUsage[parentType.name]);
          this._collectInlineFragments(typeOnSchema, inlines, types);
        }
      }
    } else if (isInterfaceType(parentType)) {
      const possibleTypes = getPossibleTypes(this._schema, parentType);

      for (const node of nodes) {
        const schemaType = node.typeCondition ? this._schema.getType(node.typeCondition.name.value) : parentType;
        const { fields, inlines, spreads } = separateSelectionSet(node.selectionSet.selections);
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
        } else {
          // it must be an interface type that is spread on an interface field
          for (const possibleType of possibleTypes) {
            if (!node.typeCondition) {
              throw new Error('Invalid state. Expected type condition for interface spread on a interface field.');
            }
            const fragmentSpreadType = this._schema.getType(node.typeCondition.name.value);
            // the field should only be added to the valid selections
            // in case the possible type actually implements the given interface
            if (isTypeSubTypeOf(this._schema, possibleType, fragmentSpreadType)) {
              this._appendToTypeMap(types, possibleType.name, fields);
              this._appendToTypeMap(types, possibleType.name, spreadsUsage[possibleType.name]);
            }
          }
        }
      }
    } else if (isUnionType(parentType)) {
      const possibleTypes = parentType.getTypes();

      for (const node of nodes) {
        const schemaType = node.typeCondition ? this._schema.getType(node.typeCondition.name.value) : parentType;
        const { fields, inlines, spreads } = separateSelectionSet(node.selectionSet.selections);
        const spreadsUsage = this.buildFragmentSpreadsUsage(spreads);

        if (isObjectType(schemaType) && possibleTypes.find(possibleType => possibleType.name === schemaType.name)) {
          this._appendToTypeMap(types, schemaType.name, fields);
          this._appendToTypeMap(types, schemaType.name, spreadsUsage[schemaType.name]);
          this._collectInlineFragments(schemaType, inlines, types);
        } else if (isInterfaceType(schemaType)) {
          const possibleInterfaceTypes = getPossibleTypes(this._schema, schemaType);

          for (const possibleType of possibleTypes) {
            if (
              possibleInterfaceTypes.find(possibleInterfaceType => possibleInterfaceType.name === possibleType.name)
            ) {
              this._appendToTypeMap(types, possibleType.name, fields);
              this._appendToTypeMap(types, possibleType.name, spreadsUsage[possibleType.name]);
              this._collectInlineFragments(schemaType, inlines, types);
            }
          }
        } else {
          for (const possibleType of possibleTypes) {
            this._appendToTypeMap(types, possibleType.name, fields);
            this._appendToTypeMap(types, possibleType.name, spreadsUsage[possibleType.name]);
          }
        }
      }
    }
  }

  protected _createInlineFragmentForFieldNodes(
    parentType: GraphQLNamedType,
    fieldNodes: FieldNode[]
  ): InlineFragmentNode {
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

  protected buildFragmentSpreadsUsage(spreads: FragmentSpreadNode[]): Record<string, FragmentSpreadUsage[]> {
    const selectionNodesByTypeName: Record<string, FragmentSpreadUsage[]> = {};

    for (const spread of spreads) {
      const fragmentSpreadObject = this._loadedFragments.find(lf => lf.name === spread.name.value);

      if (fragmentSpreadObject) {
        const schemaType = this._schema.getType(fragmentSpreadObject.onType);
        const possibleTypesForFragment = getPossibleTypes(this._schema, schemaType);

        for (const possibleType of possibleTypesForFragment) {
          const fragmentSuffix = this._getFragmentSuffix(spread.name.value);
          const usage = this.buildFragmentTypeName(
            spread.name.value,
            fragmentSuffix,
            possibleTypesForFragment.length === 1 ? null : possibleType.name
          );

          if (!selectionNodesByTypeName[possibleType.name]) {
            selectionNodesByTypeName[possibleType.name] = [];
          }

          selectionNodesByTypeName[possibleType.name].push({
            fragmentName: spread.name.value,
            typeName: usage,
            onType: fragmentSpreadObject.onType,
            selectionNodes: [...fragmentSpreadObject.node.selectionSet.selections],
          });
        }
      }
    }

    return selectionNodesByTypeName;
  }

  protected flattenSelectionSet(
    selections: ReadonlyArray<SelectionNode>
  ): Map<string, Array<SelectionNode | FragmentSpreadUsage>> {
    const selectionNodesByTypeName = new Map<string, Array<SelectionNode | FragmentSpreadUsage>>();
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

    for (const [typeName, records] of Object.entries(fragmentsUsage)) {
      this._appendToTypeMap(selectionNodesByTypeName, typeName, records);
    }

    return selectionNodesByTypeName;
  }

  private _appendToTypeMap<T = SelectionNode>(types: Map<string, Array<T>>, typeName: string, nodes: Array<T>): void {
    if (!types.has(typeName)) {
      types.set(typeName, []);
    }

    if (nodes && nodes.length > 0) {
      types.get(typeName).push(...nodes);
    }
  }

  /**
   * mustAddEmptyObject indicates that not all possible types on a union or interface field are covered.
   */
  protected _buildGroupedSelections(): { grouped: Record<string, string[]>; mustAddEmptyObject: boolean } {
    if (!this._selectionSet || !this._selectionSet.selections || this._selectionSet.selections.length === 0) {
      return { grouped: {}, mustAddEmptyObject: true };
    }

    const selectionNodesByTypeName = this.flattenSelectionSet(this._selectionSet.selections);

    // in case there is not a selection for each type, we need to add a empty type.
    let mustAddEmptyObject = false;

    const grouped = getPossibleTypes(this._schema, this._parentSchemaType).reduce((prev, type) => {
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
      } else {
        mustAddEmptyObject = true;
      }

      return prev;
    }, {} as Record<string, string[]>);

    return { grouped, mustAddEmptyObject };
  }

  protected buildSelectionSetString(
    parentSchemaType: GraphQLObjectType,
    selectionNodes: Array<SelectionNode | FragmentSpreadUsage | DirectiveNode>
  ) {
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

    // usages via fragment typescript type
    const fragmentsSpreadUsages: string[] = [];

    // ensure we mutate no function params
    selectionNodes = [...selectionNodes];
    let inlineFragmentConditional = false;

    for (const selectionNode of selectionNodes) {
      if ('kind' in selectionNode) {
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
              continue;
            }

            const fieldName = getFieldNodeNameValue(selectionNode);
            let linkFieldNode = linkFieldSelectionSets.get(fieldName);
            if (!linkFieldNode) {
              linkFieldNode = {
                selectedFieldType: selectedField.type,
                field: selectionNode,
              };
            } else {
              linkFieldNode = {
                ...linkFieldNode,
                field: {
                  ...linkFieldNode.field,
                  selectionSet: mergeSelectionSets(linkFieldNode.field.selectionSet, selectionNode.selectionSet),
                },
              };
            }
            linkFieldSelectionSets.set(fieldName, linkFieldNode);
          }
        } else if (selectionNode.kind === 'Directive') {
          if (['skip', 'include'].includes(selectionNode?.name?.value)) {
            inlineFragmentConditional = true;
          }
        } else {
          throw new TypeError('Unexpected type.');
        }
        continue;
      }

      if (this._config.inlineFragmentTypes === 'combine' || this._config.inlineFragmentTypes === 'mask') {
        fragmentsSpreadUsages.push(selectionNode.typeName);
        continue;
      }

      // Handle Fragment Spreads by generating inline types.

      const fragmentType = this._schema.getType(selectionNode.onType);

      if (fragmentType == null) {
        throw new TypeError(`Unexpected error: Type ${selectionNode.onType} does not exist within schema.`);
      }

      if (
        parentSchemaType.name === selectionNode.onType ||
        parentSchemaType.getInterfaces().find(iinterface => iinterface.name === selectionNode.onType) != null ||
        (isUnionType(fragmentType) &&
          fragmentType.getTypes().find(objectType => objectType.name === parentSchemaType.name))
      ) {
        // also process fields from fragment that apply for this parentType
        const flatten = this.flattenSelectionSet(selectionNode.selectionNodes);
        const typeNodes = flatten.get(parentSchemaType.name) ?? [];
        selectionNodes.push(...typeNodes);
        for (const iinterface of parentSchemaType.getInterfaces()) {
          const typeNodes = flatten.get(iinterface.name) ?? [];
          selectionNodes.push(...typeNodes);
        }
      }
    }

    const linkFields: LinkField[] = [];
    for (const { field, selectedFieldType } of linkFieldSelectionSets.values()) {
      const realSelectedFieldType = getBaseType(selectedFieldType as any);
      const selectionSet = this.createNext(realSelectedFieldType, field.selectionSet);
      const isConditional = hasConditionalDirectives(field) || inlineFragmentConditional;
      linkFields.push({
        alias: field.alias ? this._processor.config.formatNamedField(field.alias.value, selectedFieldType) : undefined,
        name: this._processor.config.formatNamedField(field.name.value, selectedFieldType, isConditional),
        type: realSelectedFieldType.name,
        selectionSet: this._processor.config.wrapTypeWithModifiers(
          selectionSet.transformSelectionSet().split(`\n`).join(`\n  `),
          selectedFieldType
        ),
      });
    }

    const typeInfoField = this.buildTypeNameField(
      parentSchemaType,
      this._config.nonOptionalTypename,
      this._config.addTypename,
      requireTypename,
      this._config.skipTypeNameForRoot
    );
    const transformed: ProcessResult = [
      ...(typeInfoField ? this._processor.transformTypenameField(typeInfoField.type, typeInfoField.name) : []),
      ...this._processor.transformPrimitiveFields(
        parentSchemaType,
        Array.from(primitiveFields.values()).map(field => ({
          isConditional: hasConditionalDirectives(field),
          fieldName: field.name.value,
        }))
      ),
      ...this._processor.transformAliasesPrimitiveFields(
        parentSchemaType,
        Array.from(primitiveAliasFields.values()).map(field => ({
          alias: field.alias.value,
          fieldName: field.name.value,
        }))
      ),
      ...this._processor.transformLinkFields(linkFields),
    ].filter(Boolean);

    const allStrings: string[] = transformed.filter(t => typeof t === 'string') as string[];
    const allObjectsMerged: string[] = transformed
      .filter(t => typeof t !== 'string')
      .map((t: NameAndType) => `${t.name}: ${t.type}`);
    let mergedObjectsAsString: string = null;

    if (allObjectsMerged.length > 0) {
      mergedObjectsAsString = this._processor.buildFieldsIntoObject(allObjectsMerged);
    }

    const fields = [...allStrings, mergedObjectsAsString].filter(Boolean);

    if (fragmentsSpreadUsages.length) {
      if (this._config.inlineFragmentTypes === 'combine') {
        fields.push(...fragmentsSpreadUsages);
      } else if (this._config.inlineFragmentTypes === 'mask') {
        fields.push(`{ ' $fragmentRefs': { ${fragmentsSpreadUsages.map(name => `'${name}': ${name}`).join(`;`)} } }`);
      }
    }

    return this._processor.buildSelectionSetFromStrings(fields);
  }

  protected buildTypeNameField(
    type: GraphQLObjectType,
    nonOptionalTypename: boolean = this._config.nonOptionalTypename,
    addTypename: boolean = this._config.addTypename,
    queriedForTypename: boolean = this._queriedForTypename,
    skipTypeNameForRoot: boolean = this._config.skipTypeNameForRoot
  ): { name: string; type: string } {
    const rootTypes = getRootTypes(this._schema);
    if (rootTypes.has(type) && skipTypeNameForRoot && !queriedForTypename) {
      return null;
    }

    if (nonOptionalTypename || addTypename || queriedForTypename) {
      const optionalTypename = !queriedForTypename && !nonOptionalTypename;

      return {
        name: `${this._processor.config.formatNamedField('__typename')}${optionalTypename ? '?' : ''}`,
        type: `'${type.name}'`,
      };
    }

    return null;
  }

  protected getUnknownType(): string {
    return 'never';
  }

  protected getEmptyObjectType(): string {
    return `{}`;
  }

  private getEmptyObjectTypeString(mustAddEmptyObject: boolean): string {
    return mustAddEmptyObject ? ' | ' + this.getEmptyObjectType() : ``;
  }

  public transformSelectionSet(): string {
    const { grouped, mustAddEmptyObject } = this._buildGroupedSelections();

    // This might happen in case we have an interface, that is being queries, without any GraphQL
    // "type" that implements it. It will lead to a runtime error, but we aim to try to reflect that in
    // build time as well.
    if (Object.keys(grouped).length === 0) {
      return this.getUnknownType();
    }

    return (
      Object.keys(grouped)
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
        .join(' | ') + this.getEmptyObjectTypeString(mustAddEmptyObject)
    );
  }

  public transformFragmentSelectionSetToTypes(
    fragmentName: string,
    fragmentSuffix: string,
    declarationBlockConfig
  ): string {
    const { grouped } = this._buildGroupedSelections();

    const subTypes: { name: string; content: string }[] = Object.keys(grouped)
      .map(typeName => {
        const possibleFields = grouped[typeName].filter(Boolean);
        const declarationName = this.buildFragmentTypeName(fragmentName, fragmentSuffix, typeName);

        if (possibleFields.length === 0) {
          if (!this._config.addTypename) {
            return { name: declarationName, content: this.getEmptyObjectType() };
          }

          return null;
        }

        return { name: declarationName, content: possibleFields.join(' & ') };
      })
      .filter(Boolean);

    const fragmentTypeName = this.buildFragmentTypeName(fragmentName, fragmentSuffix);
    const fragmentMaskPartial =
      this._config.inlineFragmentTypes === 'mask' ? ` & { ' $fragmentName': '${fragmentTypeName}' }` : '';

    if (subTypes.length === 1) {
      return new DeclarationBlock(declarationBlockConfig)
        .export()
        .asKind('type')
        .withName(fragmentTypeName)
        .withContent(subTypes[0].content + fragmentMaskPartial).string;
    }

    return [
      ...subTypes.map(
        t =>
          new DeclarationBlock(declarationBlockConfig)
            .export(this._config.exportFragmentSpreadSubTypes)
            .asKind('type')
            .withName(t.name)
            .withContent(
              `${t.content}${this._config.inlineFragmentTypes === 'mask' ? ` & { ' $fragmentName': '${t.name}' }` : ''}`
            ).string
      ),
      new DeclarationBlock(declarationBlockConfig)
        .export()
        .asKind('type')
        .withName(fragmentTypeName)
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
